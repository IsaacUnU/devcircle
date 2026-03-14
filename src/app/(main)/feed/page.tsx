import type { Metadata } from 'next'
import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { getFeed, getSuggestedUsers, getTrendingTags, getTopContributors } from '@/lib/queries'
import { PostCard } from '@/components/post/PostCard'
import { RightSidebar } from '@/components/layout/RightSidebar'
import { Sparkles } from 'lucide-react'
import { FeedList } from '@/components/feed/FeedList'

export const metadata: Metadata = { 
  title: 'Feed',
  description: 'Descubre los últimos posts, proyectos y conversaciones de la comunidad de desarrolladores de Devora.',
}

export default async function FeedPage() {
  const [session, { posts, hasMore }, suggested, trending, topDevs] = await Promise.all([
    auth(),
    getFeed(),
    getSuggestedUsers(),
    getTrendingTags(),
    getTopContributors(),
  ])

  return (
    <div className="flex w-full justify-center xl:justify-start">
      {/* Main feed */}
      <main className="flex-1 max-w-2xl px-4 sm:px-6 py-4 sm:py-8 border-x border-white/5 min-h-screen">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
            <Sparkles className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">Tu feed</h1>
            <p className="text-xs text-text-muted font-medium">Actualizado hace un momento</p>
          </div>
        </div>

        <FeedList 
          initialPosts={posts} 
          initialHasMore={hasMore} 
          currentUserId={session?.user?.id}
        />
      </main>

      {/* Right sidebar */}
      <RightSidebar
        suggestedUsers={suggested}
        trendingTags={trending}
        topDevs={topDevs}
      />
    </div>
  )
}


