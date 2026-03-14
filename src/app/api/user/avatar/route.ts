import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// Devuelve la imagen actualizada del usuario desde BD (no del JWT que puede estar cacheado)
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ image: null })

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { image: true },
  })

  return NextResponse.json({ image: user?.image ?? null })
}
