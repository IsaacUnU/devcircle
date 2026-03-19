'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { updateProfileSchema } from '@/lib/validations'
import { updateReputation } from './reputation'
import { checkAndAwardBadges } from './badges'

// ── Toggle Follow ────────────────────────────────────────────────────────────
export async function toggleFollow(targetUserId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')
  if (session.user.id === targetUserId) throw new Error('No puedes seguirte a ti mismo')

  const existing = await db.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: targetUserId,
      },
    },
  })

  if (existing) {
    await db.follow.delete({ where: { id: existing.id } })
    // Reputation: -5 for the unfollowed user
    await updateReputation(targetUserId, -5)
  } else {
    await db.follow.create({
      data: { followerId: session.user.id, followingId: targetUserId },
    })

    // Reputation: +5 for the followed user
    await updateReputation(targetUserId, 5)
    // Comprobar badges (first_fan, influencer, popular, rockstar)
    await checkAndAwardBadges(targetUserId).catch(() => {})

    try {
      await db.notification.upsert({
        where: {
          type_triggeredBy_receiverId: {
            type: 'FOLLOW',
            triggeredBy: session.user.id,
            receiverId: targetUserId,
          }
        },
        create: {
          type: 'FOLLOW',
          receiverId: targetUserId,
          triggeredBy: session.user.id,
        },
        update: {
          read: false,
          createdAt: new Date(),
        }
      })
    } catch (e) {
      console.warn('Duplicate notification ignored:', e)
    }
  }

  revalidatePath(`/profile/${targetUserId}`)
  return { following: !existing }
}

// ── Update Profile ───────────────────────────────────────────────────────────
export async function updateProfile(data: {
  name?: string
  bio?: string
  website?: string
  location?: string
  country?: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const parsed = updateProfileSchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.errors[0].message)

  // Combinar ciudad y país en el campo location
  const { country, location, ...rest } = parsed.data
  const fullLocation = location && country
    ? `${location}, ${country}`
    : location || country || undefined

  const user = await db.user.update({
    where: { id: session.user.id },
    data: { ...rest, ...(fullLocation !== undefined ? { location: fullLocation } : {}) },
  })

  revalidatePath(`/profile/${user.username}`)
  return user
}

// ── Mark Notifications Read ──────────────────────────────────────────────────
export async function markNotificationsRead() {
  const session = await auth()
  if (!session?.user?.id) return

  await db.notification.updateMany({
    where: { receiverId: session.user.id, read: false },
    data: { read: true },
  })

  revalidatePath('/')
}
