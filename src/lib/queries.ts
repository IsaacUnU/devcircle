import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

// ── Feed ─────────────────────────────────────────────────────────────────────
export async function getFeed(page = 1, limit = 10) {
  const session = await auth()
  const skip = (page - 1) * limit

  // If logged in, show posts from followed users + own posts
  // Otherwise show all posts
  const where = session?.user?.id
    ? {
      OR: [
        { authorId: session.user.id },
        {
          author: {
            followers: {
              some: { followerId: session.user.id },
            },
          },
        },
      ],
    }
    : {}

  const [posts, total] = await Promise.all([
    db.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, username: true, name: true, image: true },
        },
        tags: {
          include: { tag: { select: { name: true } } },
        },
        _count: {
          select: { likes: true, comments: true },
        },
        likes: session?.user?.id
          ? { where: { userId: session.user.id }, select: { id: true } }
          : false,
        bookmarks: session?.user?.id
          ? { where: { userId: session.user.id }, select: { id: true } }
          : false,
      },
    }),
    db.post.count({ where }),
  ])

  return {
    posts,
    total,
    hasMore: skip + limit < total,
    page,
  }
}

// ── Single Post ───────────────────────────────────────────────────────────────
export async function getPost(postId: string) {
  const session = await auth()

  return db.post.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: { id: true, username: true, name: true, image: true, bio: true },
      },
      tags: {
        include: { tag: { select: { name: true } } },
      },
      comments: {
        where: { parentId: null },
        orderBy: { createdAt: 'asc' },
        include: {
          author: { select: { id: true, username: true, name: true, image: true } },
          replies: {
            include: {
              author: { select: { id: true, username: true, name: true, image: true } },
            },
          },
          _count: { select: { likes: true } },
          likes: session?.user?.id
            ? { where: { userId: session.user.id }, select: { id: true } }
            : false,
        },
      },
      _count: { select: { likes: true, comments: true } },
      likes: session?.user?.id
        ? { where: { userId: session.user.id }, select: { id: true } }
        : false,
      bookmarks: session?.user?.id
        ? { where: { userId: session.user.id }, select: { id: true } }
        : false,
    },
  })
}

// ── User Profile ─────────────────────────────────────────────────────────────
export async function getUserProfile(username: string) {
  const session = await auth()

  const user = await db.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      bio: true,
      image: true,
      website: true,
      location: true,
      createdAt: true,
      reputation: true,
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true,
        },
      },
      followers: session?.user?.id
        ? { where: { followerId: session.user.id }, select: { id: true } }
        : false,
    },
  })

  return user
}

// ── User Posts ────────────────────────────────────────────────────────────────
export async function getUserPosts(username: string, page = 1, limit = 10) {
  const session = await auth()
  const skip = (page - 1) * limit

  const user = await db.user.findUnique({ where: { username }, select: { id: true } })
  if (!user) return null

  const posts = await db.post.findMany({
    where: { authorId: user.id },
    skip,
    take: limit,
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

  return posts
}

// ── Notifications ─────────────────────────────────────────────────────────────
export async function getNotifications() {
  const session = await auth()
  if (!session?.user?.id) return []

  return db.notification.findMany({
    where: { receiverId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      trigger: { select: { username: true, name: true, image: true } },
    },
  })
}

// ── Suggested Users ───────────────────────────────────────────────────────────
// Scoring: misma ciudad (+3), mismo país (+2), amigos de amigos (+2 c/u),
//          tags en común (+1 c/u, max 3), reputación/actividad (base)
export async function getSuggestedUsers() {
  const session = await auth()
  if (!session?.user?.id) return []

  // 1. Datos del usuario actual
  const me = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      location: true,
      following: { select: { followingId: true } },
      posts: {
        take: 20,
        select: { tags: { select: { tag: { select: { name: true } } } } },
      },
    },
  })
  if (!me) return []

  const followingIds = me.following.map(f => f.followingId)
  const excludeIds = [...followingIds, session.user.id]

  // Tags que usa el usuario actual
  const myTags = new Set(
    me.posts.flatMap(p => p.tags.map(t => t.tag.name))
  )

  // Ciudad y país del usuario actual
  const myCity    = me.location?.split(',')[0].trim().toLowerCase() ?? ''
  const myCountry = me.location?.split(',').at(-1)?.trim().toLowerCase() ?? ''

  // 2. Amigos de amigos: usuarios seguidos por quien sigo
  const friendsOfFriends = followingIds.length > 0
    ? await db.follow.findMany({
        where: {
          followerId: { in: followingIds },
          followingId: { notIn: excludeIds },
        },
        select: { followingId: true },
      })
    : []

  const fofCount: Record<string, number> = {}
  for (const f of friendsOfFriends) {
    fofCount[f.followingId] = (fofCount[f.followingId] ?? 0) + 1
  }

  // 3. Candidatos: usuarios no seguidos con cierta actividad
  const candidates = await db.user.findMany({
    where: { id: { notIn: excludeIds } },
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
      location: true,
      reputation: true,
      _count: { select: { followers: true, posts: true } },
      posts: {
        take: 10,
        select: { tags: { select: { tag: { select: { name: true } } } } },
      },
    },
    orderBy: { reputation: 'desc' },
    take: 40, // pool amplio para luego ordenar por score
  })

  // 4. Calcular score de cada candidato
  const scored = candidates.map(user => {
    let score = 0

    // Reputación y actividad (base, normalizada 0-2)
    score += Math.min((user.reputation ?? 0) / 50, 1)
    score += Math.min(user._count.posts / 10, 1)

    // Ubicación
    const theirCity    = user.location?.split(',')[0].trim().toLowerCase() ?? ''
    const theirCountry = user.location?.split(',').at(-1)?.trim().toLowerCase() ?? ''
    if (myCity && theirCity && myCity === theirCity)       score += 3
    else if (myCountry && theirCountry && myCountry === theirCountry) score += 2

    // Amigos de amigos
    score += Math.min((fofCount[user.id] ?? 0) * 2, 6)

    // Tags en común (max +3)
    const theirTags = new Set(user.posts.flatMap(p => p.tags.map(t => t.tag.name)))
    const common    = [...myTags].filter(t => theirTags.has(t)).length
    score += Math.min(common, 3)

    return { ...user, score }
  })

  // 5. Ordenar por score y devolver top 5
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ score: _score, posts: _posts, location: _loc, reputation: _rep, ...user }) => user)
}

// ── Trending Tags ─────────────────────────────────────────────────────────────
export async function getTrendingTags() {
  return db.tag.findMany({
    select: {
      name: true,
      _count: { select: { posts: true } },
    },
    orderBy: {
      posts: { _count: 'desc' },
    },
    take: 10,
  })
}

// ── Top Contributors ─────────────────────────────────────────────────────────
export async function getTopContributors() {
  return db.user.findMany({
    select: {
      id: true,
      username: true,
      name: true,
      image: true,        // imagen fresca desde BD siempre
      reputation: true,
      _count: { select: { posts: true, followers: true } },
    },
    orderBy: [
      { reputation: 'desc' },
      { posts: { _count: 'desc' } },
      { followers: { _count: 'desc' } },
    ],
    take: 5,
  })
}

// ── Projects ─────────────────────────────────────────────────────────────────
export async function getProjects() {
  return db.project.findMany({
    include: {
      owner: { select: { id: true, username: true, name: true, image: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

// ── Jobs ───────────────────────────────────────────────────────────────────
export async function getJobs() {
  return db.job.findMany({
    include: {
      author: { select: { id: true, username: true, name: true, image: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

// ── Groups ─────────────────────────────────────────────────────────────────
export async function getGroups() {
  return db.group.findMany({
    include: {
      _count: { select: { members: true, posts: true } },
      creator: { select: { id: true, username: true, name: true, image: true } },
      members: {
        take: 5,
        select: { user: { select: { id: true, image: true, username: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

// ── Single Group ───────────────────────────────────────────────────────────
export async function getGroup(groupId: string) {
  const session = await auth()

  const group = await db.group.findUnique({
    where: { id: groupId },
    include: {
      creator: { select: { id: true, username: true, name: true, image: true } },
      _count: { select: { members: true, posts: true } },
      members: {
        orderBy: { joinedAt: 'asc' },
        include: {
          user: { select: { id: true, username: true, name: true, image: true } },
        },
      },
      posts: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          author: { select: { id: true, username: true, name: true, image: true } },
        },
      },
    },
  })

  if (!group) return null

  const isMember = session?.user?.id
    ? group.members.some(m => m.userId === session.user.id)
    : false

  const myRole = session?.user?.id
    ? group.members.find(m => m.userId === session.user.id)?.role ?? null
    : null

  return { ...group, isMember, myRole }
}
