import type { Metadata } from 'next'
import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { getFeed, getSuggestedUsers } from '@/lib/queries'
import { PostCard } from '@/components/post/PostCard'
import { Sidebar } from '@/components/layout/Sidebar'
import { ComposeModal } from '@/components/post/ComposeModal'
import { Sparkles, Users } from 'lucide-react'
import Link from 'next/link'
import { getAvatarUrl } from '@/lib/utils'

export const metadata: Metadata = { title: 'Feed' }

export default async function FeedPage() {
  const [session, { posts }, suggested] = await Promise.all([
    auth(),
    getFeed(),
    getSuggestedUsers(),
  ])

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <ComposeModal />

      {/* Main feed */}
      <main className="ml-64 flex-1 max-w-2xl px-6 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-brand-400" />
          <h1 className="text-lg font-semibold text-text-primary">Tu feed</h1>
        </div>

        {posts.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-text-muted mb-2">Tu feed está vacío</p>
            <p className="text-sm text-text-muted">
              Sigue a otros developers para ver sus posts aquí
            </p>
          </div>
        ) : (
          <div className="space-y-4">
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
      <aside className="w-72 px-4 py-6 border-l border-surface-border hidden xl:block">
        {suggested.length > 0 && (
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-brand-400" />
              <h2 className="text-sm font-semibold text-text-primary">A quién seguir</h2>
            </div>
            <div className="space-y-3">
              {suggested.map(user => (
                <Link
                  key={user.id}
                  href={`/profile/${user.username}`}
                  className="flex items-center gap-3 hover:bg-surface-hover p-2 rounded-lg transition-colors -mx-2 group"
                >
                  <img
                    src={user.image ?? getAvatarUrl(user.username)}
                    alt=""
                    className="w-8 h-8 avatar"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary group-hover:text-brand-400 transition-colors truncate">
                      {user.name ?? user.username}
                    </p>
                    <p className="text-xs text-text-muted">
                      {user._count.followers} seguidores
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}
