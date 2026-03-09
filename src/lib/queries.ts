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
export async function getSuggestedUsers() {
  const session = await auth()
  if (!session?.user?.id) return []

  const following = await db.follow.findMany({
    where: { followerId: session.user.id },
    select: { followingId: true },
  })
  const followingIds = following.map(f => f.followingId)

  return db.user.findMany({
    where: {
      id: { notIn: [...followingIds, session.user.id] },
    },
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
      _count: { select: { followers: true } },
    },
    orderBy: { followers: { _count: 'desc' } },
    take: 5,
  })
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
      image: true,
      _count: { select: { posts: true, followers: true } },
    },
    orderBy: [
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
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}
