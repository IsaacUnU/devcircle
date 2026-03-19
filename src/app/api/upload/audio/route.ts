import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('audio') as File | null
    if (!file) return NextResponse.json({ error: 'No se recibió audio' }, { status: 400 })

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Audio demasiado grande (máx 5MB / ~2 min)' }, { status: 400 })
    }

    const ext      = file.type.includes('ogg') ? 'ogg'
                   : file.type.includes('mp4')  ? 'mp4'
                   : 'webm'
    const filename = `dm/${session.user.id}/${Date.now()}.${ext}`
    const buffer   = Buffer.from(await file.arrayBuffer())

    const { error } = await supabase.storage
      .from('audio')
      .upload(filename, buffer, { contentType: file.type, upsert: false })

    if (error) throw error

    const { data } = supabase.storage.from('audio').getPublicUrl(filename)
    return NextResponse.json({ url: data.publicUrl })
  } catch (err: any) {
    console.error('Audio upload error:', err)
    return NextResponse.json({ error: 'Error al subir audio' }, { status: 500 })
  }
}
