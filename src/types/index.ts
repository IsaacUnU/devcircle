import type { User, Post, Comment, Tag, Follow, Like, Bookmark, Notification, NotificationType } from '@prisma/client'

// ── Extended types with relations ────────────────────────────────────────────

export type PostWithMeta = Post & {
  author: Pick<User, 'id' | 'username' | 'name' | 'image'>
  tags: { tag: Pick<Tag, 'name'> }[]
  _count: { likes: number; comments: number }
  likes?: { id: string }[]
  bookmarks?: { id: string }[]
}

export type CommentWithMeta = Comment & {
  author: Pick<User, 'id' | 'username' | 'name' | 'image'>
  replies?: CommentWithMeta[]
  _count: { likes: number }
  likes?: { id: string }[]
}

export type UserProfile = Pick<User, 'id' | 'username' | 'name' | 'bio' | 'image' | 'website' | 'location' | 'createdAt'> & {
  _count: { posts: number; followers: number; following: number }
  followers?: { id: string }[]
}

export type NotificationWithTrigger = Notification & {
  trigger: Pick<User, 'username' | 'name' | 'image'>
}

// ── Session extension ────────────────────────────────────────────────────────
declare module 'next-auth' {
  interface Session {
    user: {
      id:       string
      email:    string
      username: string
      name?:    string | null
      image?:   string | null
      role:     string
    }
  }
}
