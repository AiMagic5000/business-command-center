import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { verifyPinSession, verifyPin, hashPin } from '@/lib/pin'

export async function POST(req: NextRequest) {
  try {
    const pinSession = req.cookies.get('bcc-pin-session')?.value
    if (!pinSession) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 403 })
    }

    const ownerId = verifyPinSession(pinSession)
    if (!ownerId) {
      return NextResponse.json({ error: 'Session expired' }, { status: 403 })
    }

    const { currentPin, newPin } = await req.json()

    if (!currentPin || typeof currentPin !== 'string' || !/^\d{6}$/.test(currentPin)) {
      return NextResponse.json({ error: 'Invalid current PIN format' }, { status: 400 })
    }
    if (!newPin || typeof newPin !== 'string' || !/^\d{6}$/.test(newPin)) {
      return NextResponse.json({ error: 'New PIN must be exactly 6 digits' }, { status: 400 })
    }
    if (currentPin === newPin) {
      return NextResponse.json({ error: 'New PIN must be different' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data: owner } = await supabase
      .from('business_owners')
      .select('id, pin_hash')
      .eq('id', ownerId)
      .single()

    if (!owner || !owner.pin_hash) {
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 })
    }

    const currentValid = await verifyPin(currentPin, owner.pin_hash)
    if (!currentValid) {
      return NextResponse.json({ error: 'Current PIN is incorrect' }, { status: 401 })
    }

    const newHash = await hashPin(newPin)

    const { error } = await supabase
      .from('business_owners')
      .update({ pin_hash: newHash })
      .eq('id', ownerId)

    if (error) {
      return NextResponse.json({ error: 'Failed to update PIN' }, { status: 500 })
    }

    await supabase.from('audit_log').insert({
      user_id: ownerId,
      action: 'pin_changed',
      entity_type: 'auth',
      entity_id: ownerId,
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
