import { getTrendingTags } from '@/lib/queries'
import { SearchClient } from '@/components/search/SearchClient'

export const metadata = { title: 'Explorar · DevCircle' }

export default async function SearchPage() {
  const trendingTags = await getTrendingTags()

  return <SearchClient trendingTags={trendingTags} />
}
