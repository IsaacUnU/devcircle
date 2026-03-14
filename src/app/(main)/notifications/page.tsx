import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { NotificationsClient } from '@/components/notifications/NotificationsClient'

export const metadata: Metadata = { title: 'Notificaciones · Devora' }

export default async function NotificationsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/login')

  return (
    <main className="flex-1 max-w-2xl px-4 sm:px-6 py-4 sm:py-6 border-x border-surface-border min-h-screen">
      <NotificationsClient />
    </main>
  )
}
