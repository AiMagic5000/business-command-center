import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase'
import { verifyPinSession } from '@/lib/pin'
import { decryptField } from '@/lib/crypto'

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

    const credentialId = req.nextUrl.searchParams.get('id')
    if (!credentialId) {
      return NextResponse.json({ error: 'Credential ID required' }, { status: 400 })
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

    const { data: credential, error } = await supabase
      .from('entity_credentials')
      .select(`
        *,
        entities!inner (owner_id)
      `)
      .eq('id', credentialId)
      .single()

    if (error || !credential) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 })
    }

    const entityOwnerId = (credential as Record<string, unknown>).entities as { owner_id: string }
    if (!owner.is_admin && entityOwnerId.owner_id !== owner.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    let decryptedPassword = credential.password_encrypted || ''
    if (decryptedPassword.startsWith('ENCRYPT:')) {
      decryptedPassword = decryptedPassword.slice(8)
    } else if (decryptedPassword) {
      decryptedPassword = decryptField(decryptedPassword) ?? decryptedPassword
    }

    await supabase.from('audit_log').insert({
      user_id: owner.id,
      action: 'credential_reveal',
      entity_type: 'credential',
      entity_id: credentialId,
      details: { service: credential.service_name },
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
    })

    return NextResponse.json({
      success: true,
      data: {
        ...credential,
        password_decrypted: decryptedPassword,
        entities: undefined
      }
    })
  } catch (err) {
    console.error('Credential reveal error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
