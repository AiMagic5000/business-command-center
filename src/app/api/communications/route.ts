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

    const { data: owner } = await supabase
      .from('business_owners')
      .select('id, is_admin')
      .eq('id', ownerId)
      .single()

    if (!owner) {
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 })
    }

    const queryOwnerId = req.nextUrl.searchParams.get('owner_id')
    const entityId = req.nextUrl.searchParams.get('entity_id')
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50')
    const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0')

    const targetOwnerId = owner.is_admin && queryOwnerId ? queryOwnerId : owner.id

    let query = supabase
      .from('communications')
      .select('*', { count: 'exact' })
      .eq('owner_id', targetOwnerId)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (entityId) {
      query = query.eq('entity_id', entityId)
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
      meta: { total: count, limit, offset }
    })
  } catch (err) {
    console.error('Communications fetch error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
