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
    const targetOwnerId = owner.is_admin && ownerId ? ownerId : owner.id

    const { data: entities, error } = await supabase
      .from('entities')
      .select(`
        *,
        entity_addresses (*),
        entity_credentials (*),
        entity_documents (*),
        entity_contacts (*)
      `)
      .eq('owner_id', targetOwnerId)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Also fetch relationships and compliance for the graph
    const [relResult, compResult] = await Promise.all([
      supabase
        .from('relationships')
        .select('*')
        .or(`source_id.in.(${(entities || []).map(e => e.id).join(',')}),target_id.in.(${(entities || []).map(e => e.id).join(',')})`),
      supabase
        .from('compliance_calendar')
        .select('*')
        .in('entity_id', (entities || []).map(e => e.id))
        .order('due_date', { ascending: true }),
    ])

    // Attach compliance to each entity
    const entitiesWithCompliance = (entities || []).map(e => ({
      ...e,
      addresses: e.entity_addresses,
      credentials: e.entity_credentials,
      documents: e.entity_documents,
      contacts: e.entity_contacts,
      compliance: (compResult.data || []).filter(c => c.entity_id === e.id),
    }))

    await supabase.from('audit_log').insert({
      user_id: owner.id,
      action: 'entities_list',
      entity_type: 'entity',
      details: { count: entities?.length || 0, target_owner: targetOwnerId },
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
    })

    return NextResponse.json({
      success: true,
      data: entitiesWithCompliance,
      relationships: relResult.data || [],
    })
  } catch (err) {
    console.error('Entities fetch error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
