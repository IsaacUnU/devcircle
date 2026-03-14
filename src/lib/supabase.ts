import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente público — para subida de archivos desde el browser
export const supabase = createClient(supabaseUrl, supabaseAnon)

// Helpers de Storage
export const AVATARS_BUCKET = 'avatars'
export const POSTS_BUCKET   = 'posts'

/**
 * Sube un archivo al bucket indicado y devuelve la URL pública.
 * path ejemplo: "userId/avatar.webp"
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<string> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true, contentType: file.type })

  if (error) throw new Error(`Error al subir archivo: ${error.message}`)

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Devuelve la URL pública de un archivo ya subido.
 */
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
