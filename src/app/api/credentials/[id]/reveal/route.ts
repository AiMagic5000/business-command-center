import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// This route decrypts and returns a plaintext credential password.
// In production: look up the credential in Supabase, verify ownership,
// decrypt using your server-side key, and return the plaintext.
// Never store plaintexts -- store AES-256-GCM encrypted values.

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const credentialId = params.id
    if (!credentialId) {
      return NextResponse.json({ error: 'Missing credential ID' }, { status: 400 })
    }

    // TODO: Replace with real Supabase lookup + AES decryption
    // Example:
    //   const { data } = await supabase
    //     .from('entity_credentials')
    //     .select('encrypted_password, entity_id')
    //     .eq('id', credentialId)
    //     .single()
    //   Verify user owns the entity, then decrypt.

    // Development stub
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ password: 'dev-plaintext-password' })
    }

    return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
