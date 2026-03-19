/**
 * backfill-badges.ts
 * Otorga badges retroactivamente a todos los usuarios existentes.
 * Ejecutar UNA VEZ después de npx prisma db push:
 *   npx tsx prisma/backfill-badges.ts
 */

import { PrismaClient } from '@prisma/client'
import { BADGE_DEFS } from '../src/components/badges/BadgeCard'

const db = new PrismaClient()

async function main() {
  console.log('🏅 Backfilling badges para usuarios existentes...\n')

  const users = await db.user.findMany({
    select: { id: true, username: true, createdAt: true, earnedBadges: true },
  })

  let totalAwarded = 0

  for (const user of users) {
    const [postCount, followerCount, reactionCount, codePostCount] = await Promise.all([
      db.post.count({ where: { authorId: user.id } }),
      db.follow.count({ where: { followingId: user.id } }),
      db.reaction.count({ where: { post: { authorId: user.id } } }).catch(() => 0),
      db.post.count({ where: { authorId: user.id, codeSnip: { not: null } } }),
    ])

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

    if (newBadges.length > 0) {
      await db.user.update({
        where: { id: user.id },
        data: { earnedBadges: [...Array.from(alreadyEarned), ...newBadges] },
      })
      console.log(`  ✅ @${user.username}: +${newBadges.join(', ')}`)
      totalAwarded += newBadges.length
    }
  }

  console.log(`\n✨ ${totalAwarded} badges otorgados en ${users.length} usuarios`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
