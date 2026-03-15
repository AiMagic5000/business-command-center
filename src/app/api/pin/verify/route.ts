import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase'
import { verifyPin, createPinSession } from '@/lib/pin'

const MAX_ATTEMPTS = 3
const LOCKOUT_MS = 5 * 60 * 1000

const attemptTracker = new Map<string, { count: number; lockedUntil: number }>()

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tracker = attemptTracker.get(userId)
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

    const { data: owner } = await supabase
      .from('business_owners')
      .select('id, pin_hash')
      .eq('clerk_id', userId)
      .single()

    if (!owner || !owner.pin_hash) {
      return NextResponse.json({ error: 'PIN not configured' }, { status: 404 })
    }

    const isValid = await verifyPin(pin, owner.pin_hash)

    if (!isValid) {
      const current = attemptTracker.get(userId) || { count: 0, lockedUntil: 0 }
      const newCount = current.count + 1
      attemptTracker.set(userId, {
        count: newCount,
        lockedUntil: newCount >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0,
      })

      await supabase.from('audit_log').insert({
        user_id: owner.id,
        action: 'pin_failed',
        entity_type: 'auth',
        entity_id: owner.id,
        details: { attempt: newCount },
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      })

      const remaining = MAX_ATTEMPTS - newCount
      return NextResponse.json(
        { error: remaining > 0 ? `Incorrect PIN. ${remaining} attempts remaining.` : 'Account locked for 5 minutes.' },
        { status: 401 }
      )
    }

    attemptTracker.delete(userId)

    const sessionToken = createPinSession(userId)

    await supabase.from('audit_log').insert({
      user_id: owner.id,
      action: 'pin_verified',
      entity_type: 'auth',
      entity_id: owner.id,
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
    })

    const response = NextResponse.json({ success: true, ownerId: owner.id })
    response.cookies.set('bcc-pin-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60,
    })

    return response
  } catch (err) {
    console.error('PIN verify error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
