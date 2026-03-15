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
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (!owner) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { data: layout } = await supabase
      .from('graph_layouts')
      .select('layout_json')
      .eq('owner_id', owner.id)
      .single()

    return NextResponse.json({ success: true, data: layout?.layout_json || {} })
  } catch (err) {
    console.error('Layout fetch error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pinSession = req.cookies.get('bcc-pin-session')?.value
    if (!pinSession || !verifyPinSession(pinSession)) {
      return NextResponse.json({ error: 'PIN session expired' }, { status: 403 })
    }

    const { layout_json } = await req.json()

    const supabase = createServiceClient()

    const { data: owner } = await supabase
      .from('business_owners')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (!owner) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('graph_layouts')
      .upsert({
        owner_id: owner.id,
        layout_json,
        updated_at: new Date().toISOString()
      }, { onConflict: 'owner_id' })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Layout save error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
