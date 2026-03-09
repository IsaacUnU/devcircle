'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function markAllNotificationsRead() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  await db.notification.updateMany({
    where: { receiverId: session.user.id, read: false },
    data: { read: true },
  })

  revalidatePath('/notifications')
}

export async function markNotificationRead(notificationId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  await db.notification.update({
    where: { id: notificationId, receiverId: session.user.id },
    data: { read: true },
  })

  revalidatePath('/notifications')
}

export async function getUnreadNotificationCount() {
  const session = await auth()
  if (!session?.user?.id) return 0

  return db.notification.count({
    where: { receiverId: session.user.id, read: false },
  })
}
