import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { verifyPinSession } from '@/lib/pin'
import { decrypt } from '@/lib/crypto'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const pinSession = req.cookies.get('bcc-pin-session')?.value
    if (!pinSession) {
      return NextResponse.json({ error: 'PIN session missing' }, { status: 403 })
    }

    const sessionUserId = verifyPinSession(pinSession)
    if (!sessionUserId) {
      return NextResponse.json({ error: 'PIN session expired' }, { status: 403 })
    }

    const { id: credentialId } = await params
    if (!credentialId) {
      return NextResponse.json({ error: 'Missing credential ID' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data: owner } = await supabase
      .from('business_owners')
      .select('id, is_admin')
      .eq('clerk_id', sessionUserId)
      .single()

    if (!owner) {
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 })
    }

    const { data: credential, error } = await supabase
      .from('entity_credentials')
      .select('*, entities!inner(owner_id)')
      .eq('id', credentialId)
      .single()

    if (error || !credential) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 })
    }

    const entity = credential.entities as { owner_id: string }
    if (!owner.is_admin && entity.owner_id !== owner.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    let decryptedPassword = credential.password_encrypted || ''
    try {
      if (decryptedPassword && decryptedPassword.includes(':')) {
        decryptedPassword = decrypt(decryptedPassword)
      } else if (decryptedPassword.startsWith('ENCRYPT:')) {
        decryptedPassword = decryptedPassword.replace('ENCRYPT:', '')
      }
    } catch {
      decryptedPassword = '[Decryption failed]'
    }

    await supabase.from('audit_log').insert({
      user_id: owner.id,
      action: 'credential_reveal',
      entity_type: 'credential',
      entity_id: credentialId,
      details: { service: credential.service_name },
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
    })

    return NextResponse.json({ password: decryptedPassword })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
