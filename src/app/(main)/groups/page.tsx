import { auth } from '@/lib/auth'
import { getGroups, getSuggestedUsers, getTrendingTags, getTopContributors } from '@/lib/queries'
import { RightSidebar } from '@/components/layout/RightSidebar'
import { GroupHeader } from '@/components/groups/GroupHeader'
import { GroupsList } from '@/components/groups/GroupsList'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Grupos',
  description: 'Únete a grupos de tecnología, participa en discusiones y conecta con desarrolladores que comparten tus intereses.',
}

export default async function GroupsPage() {
  const [session, groups, suggested, trending, topDevs] = await Promise.all([
    auth(),
    getGroups(),
    getSuggestedUsers(),
    getTrendingTags(),
    getTopContributors(),
  ])

  return (
    <div className="flex w-full justify-center xl:justify-start">
      <main className="flex-1 max-w-2xl px-4 sm:px-6 py-4 sm:py-8 border-x border-white/5 min-h-screen">
        <GroupHeader />
        <GroupsList groups={groups} />
      </main>
      <RightSidebar suggestedUsers={suggested} trendingTags={trending} topDevs={topDevs} />
    </div>
  )
}
