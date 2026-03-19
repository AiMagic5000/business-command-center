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

    const { data: layout } = await supabase
      .from('graph_layouts')
      .select('layout_json')
      .eq('owner_id', ownerId)
      .single()

    return NextResponse.json({ success: true, data: layout?.layout_json || {} })
  } catch (err) {
    console.error('Layout fetch error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

    const { layout_json } = await req.json()

    const supabase = createServiceClient()

    const { error } = await supabase
      .from('graph_layouts')
      .upsert({
        owner_id: ownerId,
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
