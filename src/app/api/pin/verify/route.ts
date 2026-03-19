import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { verifyPin, createPinSession } from '@/lib/pin'

const MAX_ATTEMPTS = 3
const LOCKOUT_MS = 5 * 60 * 1000

const attemptTracker = new Map<string, { count: number; lockedUntil: number }>()

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'

    const tracker = attemptTracker.get(ip)
    if (tracker && tracker.lockedUntil > Date.now()) {
      const remainingSec = Math.ceil((tracker.lockedUntil - Date.now()) / 1000)
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${remainingSec}s.` },
        { status: 429 }
      )
    }

    const { pin } = await req.json()
    if (!pin || typeof pin !== 'string' || !/^\d{6}$/.test(pin)) {
      return NextResponse.json({ error: 'Invalid PIN format' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data: owners } = await supabase
      .from('business_owners')
      .select('id, pin_hash')
      .not('pin_hash', 'is', null)

    if (!owners || owners.length === 0) {
      return NextResponse.json({ error: 'No PIN configured' }, { status: 404 })
    }

    let matchedOwner: { id: string; pin_hash: string } | null = null
    for (const owner of owners) {
      const isValid = await verifyPin(pin, owner.pin_hash)
      if (isValid) {
        matchedOwner = owner
        break
      }
    }

    if (!matchedOwner) {
      const current = attemptTracker.get(ip) || { count: 0, lockedUntil: 0 }
      const newCount = current.count + 1
      attemptTracker.set(ip, {
        count: newCount,
        lockedUntil: newCount >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0,
      })

      await supabase.from('audit_log').insert({
        user_id: null,
        action: 'pin_failed',
        entity_type: 'auth',
        entity_id: null,
        details: { attempt: newCount },
        ip_address: ip,
      })

      const remaining = MAX_ATTEMPTS - newCount
      return NextResponse.json(
        { error: remaining > 0 ? `Incorrect PIN. ${remaining} attempts remaining.` : 'Account locked for 5 minutes.' },
        { status: 401 }
      )
    }

    attemptTracker.delete(ip)

    const sessionToken = createPinSession(matchedOwner.id)

    await supabase.from('audit_log').insert({
      user_id: matchedOwner.id,
      action: 'pin_verified',
      entity_type: 'auth',
      entity_id: matchedOwner.id,
      ip_address: ip,
    })

    const response = NextResponse.json({ success: true, ownerId: matchedOwner.id })
    response.cookies.set('bcc-pin-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60,
    })

    return response
  } catch (err) {
    console.error('PIN verify error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
