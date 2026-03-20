import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { verifyPinSession } from '@/lib/pin'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const pinSession = req.cookies.get('bcc-pin-session')?.value
    if (!pinSession || !verifyPinSession(pinSession)) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 403 })
    }

    const { id } = await params
    const supabase = createServiceClient()

    const { data: doc } = await supabase
      .from('entity_documents')
      .select('name, file_path')
      .eq('id', id)
      .single()

    if (!doc || !doc.file_path) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Fetch the file from Supabase Storage
    const fileRes = await fetch(doc.file_path)
    if (!fileRes.ok) {
      return NextResponse.json({ error: 'File not available' }, { status: 404 })
    }

    const fileBuffer = await fileRes.arrayBuffer()
    const ext = doc.file_path.split('.').pop() || 'pdf'
    const contentType = ext === 'pdf' ? 'application/pdf'
      : ext === 'doc' ? 'application/msword'
      : ext === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : 'application/octet-stream'

    const fileName = doc.name.replace(/[^a-zA-Z0-9\s\-_.()]/g, '') + '.' + ext

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': String(fileBuffer.byteLength),
      },
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
