import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { verifyPinSession } from '@/lib/pin'

export async function GET(req: NextRequest) {
  try {
    const pinSession = req.cookies.get('bcc-pin-session')?.value
    if (!pinSession) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 403 })
    }
    const ownerId = verifyPinSession(pinSession)
    if (!ownerId) {
      return NextResponse.json({ error: 'Session expired' }, { status: 403 })
    }

    const supabase = createServiceClient()

    const { data: currentUser } = await supabase
      .from('business_owners')
      .select('id, is_admin')
      .eq('id', ownerId)
      .single()

    if (!currentUser) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (currentUser.is_admin) {
      const { data: owners, error } = await supabase
        .from('business_owners')
        .select('id, name, email, phone, home_address, is_admin, created_at')
        .order('name')

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, data: owners })
    }

    const { data: owner, error } = await supabase
      .from('business_owners')
      .select('id, name, email, phone, home_address, is_admin, created_at')
      .eq('id', currentUser.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: [owner] })
  } catch (err) {
    console.error('Owners fetch error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
