import { getTrendingTags, getSuggestedUsers, getTopContributors, getExplorePosts, getExploreMultimedia, getExploreEvents } from '@/lib/queries'
import { SearchClient } from '@/components/search/SearchClient'
import { RightSidebar } from '@/components/layout/RightSidebar'

export const metadata = { title: 'Explorar · Devora' }

export default async function SearchPage() {
  const [
    trendingTags,
    suggestedUsers,
    topDevs,
    explorePosts,
    exploreMultimedia,
    exploreEvents
  ] = await Promise.all([
    getTrendingTags(),
    getSuggestedUsers(),
    getTopContributors(),
    getExplorePosts(),
    getExploreMultimedia(),
    getExploreEvents(),
  ])

  return (
    <div className="flex w-full justify-center xl:justify-start">
      <SearchClient 
        trendingTags={trendingTags} 
        explorePosts={explorePosts}
        exploreMultimedia={exploreMultimedia}
        exploreEvents={exploreEvents}
      />
      <RightSidebar
        suggestedUsers={suggestedUsers}
        trendingTags={trendingTags}
        topDevs={topDevs}
      />
    </div>
  )
}
