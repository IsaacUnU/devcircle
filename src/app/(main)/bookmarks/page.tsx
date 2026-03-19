import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { PostCard } from '@/components/post/PostCard'
import { Bookmark, Search, Hash, FolderOpen, Clock } from 'lucide-react'
import { RightSidebar } from '@/components/layout/RightSidebar'
import { getSuggestedUsers, getTrendingTags, getTopContributors } from '@/lib/queries'
import { BookmarksClient } from '@/components/bookmarks/BookmarksClient'

export const metadata: Metadata = { title: 'Guardados · Devora' }

export default async function BookmarksPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/login')

  const [bookmarks, suggestedUsers, trendingTags, topDevs] = await Promise.all([
    db.bookmark.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        post: {
          include: {
            author: { select: { id: true, username: true, name: true, image: true } },
            tags: { include: { tag: { select: { name: true } } } },
            _count: { select: { likes: true, comments: true } },
            likes: { where: { userId: session.user.id }, select: { id: true } },
            bookmarks: { where: { userId: session.user.id }, select: { id: true } },
          },
        },
      },
    }),
    getSuggestedUsers(),
    getTrendingTags(),
    getTopContributors(),
  ])

  const posts = bookmarks.map(b => ({
    ...b.post,
    savedAt: b.createdAt,
  }))

  // Extract all unique tags from bookmarked posts
  const allTags = Array.from(
    new Set(posts.flatMap(p => p.tags.map(t => t.tag.name)))
  ).sort()

  return (
    <div className="flex w-full justify-center xl:justify-start">
      <main className="flex-1 max-w-2xl lg:max-w-3xl xl:max-w-2xl px-4 sm:px-6 py-4 sm:py-6 border-x border-surface-border min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-brand-400 fill-brand-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">Guardados</h1>
              <p className="text-xs text-text-muted">{posts.length} posts guardados</p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        {posts.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6 animate-slide-up">
            <div className="card p-3 text-center !rounded-xl hover:!transform-none">
              <FolderOpen className="w-4 h-4 text-brand-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-text-primary">{posts.length}</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">Total</p>
            </div>
            <div className="card p-3 text-center !rounded-xl hover:!transform-none">
              <Hash className="w-4 h-4 text-purple-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-text-primary">{allTags.length}</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">Tags</p>
            </div>
            <div className="card p-3 text-center !rounded-xl hover:!transform-none">
              <Clock className="w-4 h-4 text-orange-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-text-primary">
                {posts[0] ? new Date(posts[0].savedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '—'}
              </p>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">Último</p>
            </div>
          </div>
        )}

        {/* Client-side search and filter */}
        <BookmarksClient
          posts={JSON.parse(JSON.stringify(posts))}
          allTags={allTags}
          currentUserId={session.user.id}
        />
      </main>
      <RightSidebar
        suggestedUsers={suggestedUsers}
        trendingTags={trendingTags}
        topDevs={topDevs}
      />
    </div>
  )
}
