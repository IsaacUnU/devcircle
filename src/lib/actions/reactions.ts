'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { updateReputation } from './reputation'
import { checkAndAwardBadges } from './badges'

export type ReactionType = 'HEART' | 'FIRE' | 'ZAPPER' | 'BULB' | 'ROCKET' | 'EYES'

// ── Toggle Reaction on Post ───────────────────────────────────────────────────
// Reglas:
//   - Solo 1 reacción por usuario por post
//   - Clic en la misma → quitar (toggle off)
//   - Clic en otra distinta → cambiar (borra la anterior, crea la nueva)
export async function toggleReaction(postId: string, type: ReactionType) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  // ¿Ya tiene alguna reacción en este post?
  const existing = await db.$queryRaw<{ id: string; type: string }[]>`
    SELECT id, type::text FROM reactions
    WHERE "userId" = ${session.user.id}
      AND "postId"  = ${postId}
    LIMIT 1
  `

  const post = await db.post.findUnique({ where: { id: postId }, select: { authorId: true } })

  if (existing.length > 0 && existing[0].type === type) {
    // MISMO tipo → quitar reacción (toggle off)
    await db.$executeRaw`DELETE FROM reactions WHERE id = ${existing[0].id}`

    if (post && post.authorId !== session.user.id) {
      await updateReputation(post.authorId, -2)
    }
    revalidatePath('/feed')
    return { reacted: false, type }
  }

  if (existing.length > 0) {
    // TIPO DIFERENTE → cambiar reacción (UPDATE in-place)
    await db.$executeRaw`
      UPDATE reactions
      SET type = ${type}::"ReactionType", "createdAt" = NOW()
      WHERE id = ${existing[0].id}
    `
    // Reputación neutra al cambiar (ya tenía +2, no sumamos ni restamos)
    revalidatePath('/feed')
    return { reacted: true, type }
  }

  // SIN reacción previa → crear
  await db.$executeRaw`
    INSERT INTO reactions (id, type, "userId", "postId", "commentId", "createdAt")
    VALUES (
      gen_random_uuid()::text,
      ${type}::"ReactionType",
      ${session.user.id},
      ${postId},
      NULL,
      NOW()
    )
  `

  if (post && post.authorId !== session.user.id) {
    await updateReputation(post.authorId, 2)
    await checkAndAwardBadges(post.authorId).catch(() => {})

    try {
      await db.notification.upsert({
        where: {
          type_triggeredBy_receiverId: {
            type:        'REACTION',
            triggeredBy: session.user.id,
            receiverId:  post.authorId,
          },
        },
        update: { read: false, createdAt: new Date(), postId },
        create: {
          type:        'REACTION',
          receiverId:  post.authorId,
          triggeredBy: session.user.id,
          postId,
        },
      })
    } catch { /* no bloquear si falla la notificación */ }
  }

  revalidatePath('/feed')
  return { reacted: true, type }
}

// ── Toggle Reaction on Comment ────────────────────────────────────────────────
export async function toggleCommentReaction(commentId: string, type: ReactionType) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const existing = await db.$queryRaw<{ id: string; type: string }[]>`
    SELECT id, type::text FROM reactions
    WHERE "userId"    = ${session.user.id}
      AND "commentId" = ${commentId}
    LIMIT 1
  `

  if (existing.length > 0 && existing[0].type === type) {
    // Mismo tipo → quitar
    await db.$executeRaw`DELETE FROM reactions WHERE id = ${existing[0].id}`
    return { reacted: false, type }
  }

  if (existing.length > 0) {
    // Tipo distinto → cambiar
    await db.$executeRaw`
      UPDATE reactions
      SET type = ${type}::"ReactionType", "createdAt" = NOW()
      WHERE id = ${existing[0].id}
    `
    return { reacted: true, type }
  }

  // Sin reacción previa → crear
  await db.$executeRaw`
    INSERT INTO reactions (id, type, "userId", "postId", "commentId", "createdAt")
    VALUES (
      gen_random_uuid()::text,
      ${type}::"ReactionType",
      ${session.user.id},
      NULL,
      ${commentId},
      NOW()
    )
  `
  return { reacted: true, type }
}
