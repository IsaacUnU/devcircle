import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Devuelve solo la imagen del usuario — nunca pasa por el JWT ni cookies
export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('username')
  if (!username) return NextResponse.json({ image: null })

  const user = await db.user.findUnique({
    where: { username },
    select: { image: true },
  })

  return NextResponse.json({ image: user?.image ?? null })
}
