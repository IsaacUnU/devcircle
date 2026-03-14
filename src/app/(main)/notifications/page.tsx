import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { NotificationsClient } from '@/components/notifications/NotificationsClient'
import { RightSidebar } from '@/components/layout/RightSidebar'
import { getSuggestedUsers, getTrendingTags, getTopContributors } from '@/lib/queries'

export const metadata: Metadata = { title: 'Notificaciones · Devora' }

export default async function NotificationsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/login')

  const [suggestedUsers, trendingTags, topDevs] = await Promise.all([
    getSuggestedUsers(),
    getTrendingTags(),
    getTopContributors(),
  ])

  return (
    <div className="flex w-full justify-center xl:justify-start">
      <main className="flex-1 max-w-2xl px-4 sm:px-6 py-4 sm:py-6 border-x border-surface-border min-h-screen">
        <NotificationsClient />
      </main>
      <RightSidebar
        suggestedUsers={suggestedUsers}
        trendingTags={trendingTags}
        topDevs={topDevs}
      />
    </div>
  )
}
