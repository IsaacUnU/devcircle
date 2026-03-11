import { auth } from '@/lib/auth'
import { getGroups, getSuggestedUsers, getTrendingTags, getTopContributors } from '@/lib/queries'
import { RightSidebar } from '@/components/layout/RightSidebar'
import { GroupHeader } from '@/components/groups/GroupHeader'
import { GroupsList } from '@/components/groups/GroupsList'

export default async function GroupsPage() {
  const [session, groups, suggested, trending, topDevs] = await Promise.all([
    auth(),
    getGroups(),
    getSuggestedUsers(),
    getTrendingTags(),
    getTopContributors(),
  ])

  return (
    <div className="flex-1 flex max-w-[1240px] mx-auto">
      <main className="flex-1 px-6 py-8 border-x border-surface-border min-h-screen">
        <GroupHeader />
        <GroupsList groups={groups} />
      </main>
      <RightSidebar suggestedUsers={suggested} trendingTags={trending} topDevs={topDevs} />
    </div>
  )
}
