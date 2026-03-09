import type { Metadata } from 'next'
import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { getFeed, getSuggestedUsers, getTrendingTags, getTopContributors } from '@/lib/queries'
import { PostCard } from '@/components/post/PostCard'
import { RightSidebar } from '@/components/layout/RightSidebar'
import { Sparkles } from 'lucide-react'

export const metadata: Metadata = { title: 'Feed' }

export default async function FeedPage() {
  const [session, { posts }, suggested, trending, topDevs] = await Promise.all([
    auth(),
    getFeed(),
    getSuggestedUsers(),
    getTrendingTags(),
    getTopContributors(),
  ])

  return (
    <div className="flex w-full justify-center xl:justify-start">
      {/* Main feed */}
      <main className="flex-1 max-w-2xl px-6 py-8 border-x border-white/5 min-h-screen">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
            <Sparkles className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">Tu feed</h1>
            <p className="text-xs text-text-muted font-medium">Actualizado hace un momento</p>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="card p-16 text-center shadow-xl">
            <div className="w-16 h-16 bg-surface-hover rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
              <Sparkles className="w-8 h-8 text-text-muted opacity-30" />
            </div>
            <p className="text-text-primary font-bold text-lg mb-2">Tu feed está muy tranquilo</p>
            <p className="text-sm text-text-muted max-w-xs mx-auto">
              Sigue a otros developers de la comunidad para ver sus proyectos y aprendizajes aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post as any}
                currentUserId={session?.user?.id}
              />
            ))}
          </div>
        )}
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


