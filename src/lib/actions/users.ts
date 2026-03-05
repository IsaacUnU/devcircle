'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { updateProfileSchema } from '@/lib/validations'

// ── Toggle Follow ────────────────────────────────────────────────────────────
export async function toggleFollow(targetUserId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')
  if (session.user.id === targetUserId) throw new Error('No puedes seguirte a ti mismo')

  const existing = await db.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId:  session.user.id,
        followingId: targetUserId,
      },
    },
  })

  if (existing) {
    await db.follow.delete({ where: { id: existing.id } })
  } else {
    await db.follow.create({
      data: { followerId: session.user.id, followingId: targetUserId },
    })

    await db.notification.create({
      data: {
        type:        'FOLLOW',
        receiverId:  targetUserId,
        triggeredBy: session.user.id,
      },
    })
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
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const parsed = updateProfileSchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.errors[0].message)

  const user = await db.user.update({
    where: { id: session.user.id },
    data:  parsed.data,
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
    data:  { read: true },
  })

  revalidatePath('/')
}
