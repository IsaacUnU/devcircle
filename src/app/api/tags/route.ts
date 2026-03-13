import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.toLowerCase().trim() ?? ''

  const tags = await db.tag.findMany({
    where: q ? { name: { contains: q } } : {},
    select: {
      name: true,
      _count: { select: { posts: true } },
    },
    orderBy: { posts: { _count: 'desc' } },
    take: 8,
  })

  return NextResponse.json(tags)
}
