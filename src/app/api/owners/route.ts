import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase'
import { verifyPinSession } from '@/lib/pin'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pinSession = req.cookies.get('bcc-pin-session')?.value
    if (!pinSession || !verifyPinSession(pinSession)) {
      return NextResponse.json({ error: 'PIN session expired' }, { status: 403 })
    }

    const supabase = createServiceClient()

    const { data: currentUser } = await supabase
      .from('business_owners')
      .select('id, is_admin')
      .eq('clerk_id', userId)
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
