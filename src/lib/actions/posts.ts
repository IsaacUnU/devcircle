'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { createPostSchema, createCommentSchema } from '@/lib/validations'
import { updateReputation } from './reputation'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'

// ── Create Post ─────────────────────────────────────────────────────────────
export async function createPost(data: {
  content: string
  codeSnip?: string
  language?: string
  tags?: string[]
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const rl = await rateLimit('createPost', session.user.id, RATE_LIMITS.createPost)
  if (!rl.ok) throw new Error(rl.message)

  const parsed = createPostSchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.errors[0].message)

  const { content, codeSnip, language, tags } = parsed.data

  const post = await db.post.create({
    data: {
      content,
      codeSnip,
      language,
      authorId: session.user.id,
      tags: tags?.length
        ? {
          create: tags.map(name => ({
            tag: {
              connectOrCreate: {
                where: { name },
                create: { name },
              },
            },
          })),
        }
        : undefined,
    },
    include: { author: true, tags: { include: { tag: true } } },
  })

  // Reputation: +5 for creating a post
  await updateReputation(session.user.id, 5)

  revalidatePath('/feed')
  return post
}

// ── Delete Post ─────────────────────────────────────────────────────────────
export async function deletePost(postId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const post = await db.post.findUnique({ where: { id: postId } })
  if (!post) throw new Error('Post no encontrado')
  if (post.authorId !== session.user.id && session.user.role !== 'ADMIN') {
    throw new Error('Sin permiso')
  }

  await db.post.delete({ where: { id: postId } })

  // Reputation: -5 for deleting a post
  await updateReputation(session.user.id, -5)

  revalidatePath('/feed')
}

// ── Toggle Like ─────────────────────────────────────────────────────────────
export async function toggleLike(postId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const existing = await db.like.findUnique({
    where: { userId_postId: { userId: session.user.id, postId } },
  })

  if (existing) {
    await db.like.delete({ where: { id: existing.id } })

    // Reputation: -2 for the post author when unliked
    const post = await db.post.findUnique({ where: { id: postId } })
    if (post) await updateReputation(post.authorId, -2)

  } else {
    await db.like.create({ data: { userId: session.user.id, postId } })

    // Create notification for post author
    const post = await db.post.findUnique({ where: { id: postId } })
    if (post && post.authorId !== session.user.id) {
      // Reputation: +2 for the post author when liked
      await updateReputation(post.authorId, 2)

      await db.notification.upsert({
        where: {
          type_triggeredBy_receiverId: {
            type: 'LIKE',
            triggeredBy: session.user.id,
            receiverId: post.authorId,
          },
        },
        update: { read: false, createdAt: new Date(), postId },
        create: {
          type: 'LIKE',
          receiverId: post.authorId,
          triggeredBy: session.user.id,
          postId,
        },
      })
    }
  }

  revalidatePath('/feed')
  return { liked: !existing }
}

// ── Toggle Bookmark ──────────────────────────────────────────────────────────
export async function toggleBookmark(postId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const existing = await db.bookmark.findUnique({
    where: { userId_postId: { userId: session.user.id, postId } },
  })

  if (existing) {
    await db.bookmark.delete({ where: { id: existing.id } })
  } else {
    await db.bookmark.create({ data: { userId: session.user.id, postId } })
  }

  revalidatePath('/feed')
  return { bookmarked: !existing }
}

// ── Add Comment ──────────────────────────────────────────────────────────────
export async function addComment(data: {
  content: string
  postId: string
  parentId?: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const rl = await rateLimit('addComment', session.user.id, RATE_LIMITS.addComment)
  if (!rl.ok) throw new Error(rl.message)

  const parsed = createCommentSchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.errors[0].message)

  const comment = await db.comment.create({
    data: {
      content: parsed.data.content,
      postId: parsed.data.postId,
      parentId: parsed.data.parentId,
      authorId: session.user.id,
    },
    include: { author: true },
  })

  // Notify post author — upsert para evitar unique constraint si comenta varias veces
  const post = await db.post.findUnique({ where: { id: data.postId } })
  if (post && post.authorId !== session.user.id) {
    const notifType = data.parentId ? 'REPLY' : 'COMMENT'
    await db.notification.upsert({
      where: {
        type_triggeredBy_receiverId: {
          type: notifType,
          triggeredBy: session.user.id,
          receiverId: post.authorId,
        },
      },
      update: {
        read: false,
        createdAt: new Date(),
        commentId: comment.id,
        postId: data.postId,
      },
      create: {
        type: notifType,
        receiverId: post.authorId,
        triggeredBy: session.user.id,
        postId: data.postId,
        commentId: comment.id,
      },
    })
  }

  revalidatePath(`/post/${data.postId}`)
  return comment
}
