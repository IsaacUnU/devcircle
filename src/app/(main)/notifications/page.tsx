import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { getAvatarUrl, timeAgo } from '@/lib/utils'
import { markAllNotificationsRead } from '@/lib/actions/notifications'
import Link from 'next/link'
import { Heart, MessageCircle, UserPlus, AtSign, Bell, CheckCheck } from 'lucide-react'
import { NotificationItem } from '@/components/notifications/NotificationItem'
import { MarkReadButton } from '@/components/notifications/MarkReadButton'

export const metadata: Metadata = { title: 'Notificaciones · DevCircle' }

export default async function NotificationsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/login')

  const notifications = await db.notification.findMany({
    where: { receiverId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      trigger: {
        select: { id: true, username: true, name: true, image: true },
      },
    },
  })

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <main className="flex-1 max-w-2xl px-6 py-6 border-r border-surface-border min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-brand-400" />
          <h1 className="text-xl font-bold text-text-primary">Notificaciones</h1>
          {unreadCount > 0 && (
            <span className="text-xs bg-brand-500 text-white px-2 py-0.5 rounded-full font-bold">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && <MarkReadButton />}
      </div>

      {/* Notification list */}
      {notifications.length === 0 ? (
        <div className="card p-16 text-center">
          <Bell className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
          <p className="text-text-secondary font-medium">Sin notificaciones aún</p>
          <p className="text-sm text-text-muted mt-1">
            Cuando alguien interactúe con tus posts aparecerá aquí
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {notifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification as any}
            />
          ))}
        </div>
      )}
    </main>
  )
}
