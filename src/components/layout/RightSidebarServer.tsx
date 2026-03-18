import { getSuggestedUsers, getTrendingTags, getTopContributors } from '@/lib/queries'
import { RightSidebar } from './RightSidebar'

export async function RightSidebarServer() {
    const [suggested, trending, topDevs] = await Promise.all([
        getSuggestedUsers(),
        getTrendingTags(),
        getTopContributors(),
    ])

    return (
        <RightSidebar 
            suggestedUsers={suggested} 
            trendingTags={trending} 
            topDevs={topDevs} 
        />
    )
}
