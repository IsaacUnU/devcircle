import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(
  _req: Request,
  { params }: { params: { username: string } }
) {
  const session = await auth()

  const user = await db.user.findUnique({
    where: { username: params.username },
    select: { id: true },
  })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const followers = await db.follow.findMany({
    where: { followingId: user.id },
    include: {
      follower: {
        select: {
          id: true, username: true, name: true, image: true,
          bio: true, reputation: true,
          _count: { select: { followers: true, posts: true } },
          // Si el usuario actual sigue a cada uno
          followers: session?.user?.id
            ? { where: { followerId: session.user.id }, select: { id: true } }
            : false,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(followers.map(f => f.follower))
}
