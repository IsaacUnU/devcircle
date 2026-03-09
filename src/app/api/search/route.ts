import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() ?? ''
  const tab = searchParams.get('tab') ?? 'all'

  if (!q || q.length < 1) {
    return NextResponse.json({ users: [], posts: [], tags: [] })
  }

  // Handle tag search (starts with #)
  const isTagSearch = q.startsWith('#')
  const searchTerm = isTagSearch ? q.slice(1) : q

  const [users, posts, tags] = await Promise.all([
    // Users search
    (tab === 'all' || tab === 'users') && !isTagSearch
      ? db.user.findMany({
          where: {
            OR: [
              { username: { contains: searchTerm, mode: 'insensitive' } },
              { name: { contains: searchTerm, mode: 'insensitive' } },
              { bio: { contains: searchTerm, mode: 'insensitive' } },
            ],
          },
          take: tab === 'users' ? 20 : 5,
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
            bio: true,
            _count: { select: { followers: true, posts: true } },
            followers: session?.user?.id
              ? { where: { followerId: session.user.id }, select: { id: true } }
              : false,
          },
        })
      : Promise.resolve([]),

    // Posts search
    (tab === 'all' || tab === 'posts')
      ? db.post.findMany({
          where: isTagSearch
            ? { tags: { some: { tag: { name: { contains: searchTerm, mode: 'insensitive' } } } } }
            : {
                OR: [
                  { content: { contains: searchTerm, mode: 'insensitive' } },
                  { codeSnip: { contains: searchTerm, mode: 'insensitive' } },
                ],
              },
          take: tab === 'posts' ? 20 : 5,
          orderBy: { createdAt: 'desc' },
          include: {
            author: { select: { id: true, username: true, name: true, image: true } },
            tags: { include: { tag: { select: { name: true } } } },
            _count: { select: { likes: true, comments: true } },
            likes: session?.user?.id
              ? { where: { userId: session.user.id }, select: { id: true } }
              : false,
            bookmarks: session?.user?.id
              ? { where: { userId: session.user.id }, select: { id: true } }
              : false,
          },
        })
      : Promise.resolve([]),

    // Tags search
    (tab === 'all' || tab === 'tags')
      ? db.tag.findMany({
          where: { name: { contains: searchTerm, mode: 'insensitive' } },
          take: tab === 'tags' ? 30 : 8,
          include: { _count: { select: { posts: true } } },
          orderBy: { posts: { _count: 'desc' } },
        })
      : Promise.resolve([]),
  ])

  // Format users to include isFollowing flag
  const formattedUsers = (users as any[]).map(u => ({
    ...u,
    isFollowing: session?.user?.id ? (u.followers?.length > 0) : false,
    followers: undefined,
  }))

  return NextResponse.json({ users: formattedUsers, posts, tags })
}
