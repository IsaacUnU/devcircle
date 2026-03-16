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

  const [users, posts, tags, multimedia] = await Promise.all([
    // 1. Users search (High priority for exact matches)
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
          orderBy: [
            { username: 'asc' },
            { reputation: 'desc' }
          ],
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

    // 2. Advanced Posts search (Includes results from matching authors)
    (tab === 'all' || tab === 'posts')
      ? db.post.findMany({
          where: isTagSearch
            ? { tags: { some: { tag: { name: { contains: searchTerm, mode: 'insensitive' } } } } }
            : {
                OR: [
                  { content: { contains: searchTerm, mode: 'insensitive' } },
                  { codeSnip: { contains: searchTerm, mode: 'insensitive' } },
                  // X-style: Include posts from users whose name/username matches
                  { 
                    author: { 
                      OR: [
                        { username: { contains: searchTerm, mode: 'insensitive' } },
                        { name: { contains: searchTerm, mode: 'insensitive' } }
                      ]
                    } 
                  }
                ],
              },
          take: tab === 'posts' ? 30 : 10,
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

    // 3. Related Topics (Tags)
    (tab === 'all' || tab === 'tags')
      ? db.tag.findMany({
          where: { name: { contains: searchTerm, mode: 'insensitive' } },
          take: tab === 'tags' ? 30 : 10,
          include: { _count: { select: { posts: true } } },
          orderBy: { posts: { _count: 'desc' } },
        })
      : Promise.resolve([]),

    // 4. Multimedia search (Posts with images)
    (tab === 'all' || tab === 'multimedia')
      ? db.post.findMany({
          where: {
            published: true,
            image: { not: null },
            OR: [
              { content: { contains: searchTerm, mode: 'insensitive' } },
              { tags: { some: { tag: { name: { contains: searchTerm, mode: 'insensitive' } } } } },
              { 
                author: { 
                  OR: [
                    { username: { contains: searchTerm, mode: 'insensitive' } },
                    { name: { contains: searchTerm, mode: 'insensitive' } }
                  ]
                } 
              }
            ],
          },
          take: tab === 'multimedia' ? 30 : 10,
          orderBy: { createdAt: 'desc' },
          include: {
            author: { select: { id: true, username: true, name: true, image: true } },
            tags: { include: { tag: { select: { name: true } } } },
            _count: { select: { likes: true, comments: true } },
            likes: session?.user?.id
              ? { where: { userId: session.user.id }, select: { id: true } }
              : false,
          },
        })
      : Promise.resolve([]),
  ])

  // Post-processing for relevance: Sort exact username matches to the top
  const sortedUsers = (users as any[]).sort((a, b) => {
    const aMatch = a.username.toLowerCase() === searchTerm.toLowerCase() || a.name?.toLowerCase() === searchTerm.toLowerCase()
    const bMatch = b.username.toLowerCase() === searchTerm.toLowerCase() || b.name?.toLowerCase() === searchTerm.toLowerCase()
    if (aMatch && !bMatch) return -1
    if (!aMatch && bMatch) return 1
    return 0
  })

  // Format users to include isFollowing flag
  const formattedUsers = sortedUsers.map(u => ({
    ...u,
    isFollowing: session?.user?.id ? (u.followers?.length > 0) : false,
    followers: undefined,
  }))

  return NextResponse.json({ 
    users: formattedUsers, 
    posts: posts as any[], 
    relatedTopics: tags as any[], 
    multimedia: multimedia as any[] 
  })
}
