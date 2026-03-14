import { getTrendingTags, getSuggestedUsers, getTopContributors } from '@/lib/queries'
import { SearchClient } from '@/components/search/SearchClient'
import { RightSidebar } from '@/components/layout/RightSidebar'

export const metadata = { title: 'Explorar · Devora' }

export default async function SearchPage() {
  const [trendingTags, suggestedUsers, topDevs] = await Promise.all([
    getTrendingTags(),
    getSuggestedUsers(),
    getTopContributors(),
  ])

  return (
    <div className="flex w-full justify-center xl:justify-start">
      <SearchClient trendingTags={trendingTags} />
      <RightSidebar
        suggestedUsers={suggestedUsers}
        trendingTags={trendingTags}
        topDevs={topDevs}
      />
    </div>
  )
}
