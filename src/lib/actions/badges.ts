'use server'

import { db } from '@/lib/db'
import { BADGE_DEFS } from '@/components/badges/BadgeCard'

// ─── Comprobar y otorgar badges automáticamente ───────────────────────────────
export async function checkAndAwardBadges(userId: string) {
  try {
    const [postCount, followerCount, codePostCount, user] = await Promise.all([
      db.post.count({ where: { authorId: userId } }),
      db.follow.count({ where: { followingId: userId } }),
      db.post.count({ where: { authorId: userId, codeSnip: { not: null } } }),
      db.user.findUnique({
        where: { id: userId },
        select: { createdAt: true, earnedBadges: true },
      }),
    ])

    if (!user) return

    // Contar reacciones recibidas via raw SQL (evita dep del cliente Prisma)
    const reactionRows = await db.$queryRaw<{ count: string }[]>`
      SELECT COUNT(*)::text as count FROM reactions r
      JOIN posts p ON r."postId" = p.id
      WHERE p."authorId" = ${userId}
    `
    const reactionCount = parseInt(reactionRows[0]?.count ?? '0', 10)

    const alreadyEarned = new Set<string>(
      Array.isArray(user.earnedBadges) ? (user.earnedBadges as string[]) : []
    )

    const daysSinceJoin = (Date.now() - user.createdAt.getTime()) / 86400000
    const newBadges: string[] = []

    for (const badge of BADGE_DEFS) {
      if (alreadyEarned.has(badge.slug)) continue

      let earned = false
      switch (badge.slug) {
        case 'first_post':     earned = postCount >= 1;        break
        case 'storyteller':    earned = postCount >= 10;       break
        case 'prolific':       earned = postCount >= 50;       break
        case 'legend':         earned = postCount >= 200;      break
        case 'first_fan':      earned = followerCount >= 1;    break
        case 'influencer':     earned = followerCount >= 50;   break
        case 'popular':        earned = followerCount >= 200;  break
        case 'rockstar':       earned = followerCount >= 1000; break
        case 'liked':          earned = reactionCount >= 10;   break
        case 'beloved':        earned = reactionCount >= 100;  break
        case 'viral':          earned = reactionCount >= 500;  break
        case 'code_sharer':    earned = codePostCount >= 5;    break
        case 'early_adopter':  earned = daysSinceJoin < 90;   break
      }

      if (earned) newBadges.push(badge.slug)
    }

    if (newBadges.length === 0) return

    const merged = [...Array.from(alreadyEarned), ...newBadges]
    await db.$executeRaw`
      UPDATE users SET "earnedBadges" = ${JSON.stringify(merged)}::jsonb
      WHERE id = ${userId}
    `
  } catch (e) {
    // No bloquear el flujo principal si los badges fallan
    console.error('checkAndAwardBadges error:', e)
  }
}

// ─── Obtener badges de un usuario ─────────────────────────────────────────────
export async function getUserBadges(userId: string): Promise<string[]> {
  const rows = await db.$queryRaw<{ earnedBadges: unknown }[]>`
    SELECT "earnedBadges" FROM users WHERE id = ${userId}
  `
  const raw = rows[0]?.earnedBadges
  if (!Array.isArray(raw)) return []
  return raw as string[]
}
