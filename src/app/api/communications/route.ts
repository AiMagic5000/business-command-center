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
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50')
    const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0')

    const targetOwnerId = owner.is_admin && ownerId ? ownerId : owner.id

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
