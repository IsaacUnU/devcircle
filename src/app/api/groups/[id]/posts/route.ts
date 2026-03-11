import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const posts = await db.groupPost.findMany({
      where: { groupId: params.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        author: { select: { id: true, username: true, name: true, image: true } },
      },
    })
    return NextResponse.json({ posts })
  } catch {
    return NextResponse.json({ posts: [] })
  }
}
