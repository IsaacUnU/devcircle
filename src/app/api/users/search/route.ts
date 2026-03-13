import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() ?? ''

  const users = await db.user.findMany({
    where: q
      ? {
          OR: [
            { username: { contains: q, mode: 'insensitive' } },
            { name: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}, // sin filtro → top usuarios por popularidad
    take: 6,
    select: { id: true, username: true, name: true, image: true },
    orderBy: q ? { username: 'asc' } : { followers: { _count: 'desc' } },
  })

  return NextResponse.json(users)
}
