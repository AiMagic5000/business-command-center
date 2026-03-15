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

    const { data: owner } = await supabase
      .from('business_owners')
      .select('id, is_admin')
      .eq('clerk_id', userId)
      .single()

    if (!owner) {
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 })
    }

    const ownerId = req.nextUrl.searchParams.get('owner_id')
    const entityId = req.nextUrl.searchParams.get('entity_id')
    const targetOwnerId = owner.is_admin && ownerId ? ownerId : owner.id

    let query = supabase
      .from('payments')
      .select('*')
      .eq('owner_id', targetOwnerId)
      .order('payment_date', { ascending: false })

    if (entityId) {
      query = query.eq('entity_id', entityId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const totalPaid = (data || [])
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0)

    return NextResponse.json({
      success: true,
      data,
      meta: { totalPaid, count: data?.length || 0 }
    })
  } catch (err) {
    console.error('Payments fetch error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
