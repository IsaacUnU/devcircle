import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { PostCard } from '@/components/post/PostCard'
import { Bookmark } from 'lucide-react'

export const metadata: Metadata = { title: 'Guardados · DevCircle' }

export default async function BookmarksPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/login')

  const bookmarks = await db.bookmark.findMany({
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
  })

  const posts = bookmarks.map(b => b.post)

  return (
    <main className="flex-1 max-w-2xl px-6 py-6 border-r border-surface-border min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <Bookmark className="w-6 h-6 text-brand-400 fill-brand-400" />
        <h1 className="text-xl font-bold text-text-primary">Guardados</h1>
        <span className="text-sm text-text-muted">({posts.length})</span>
      </div>

      {posts.length === 0 ? (
        <div className="card p-16 text-center">
          <Bookmark className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
          <p className="text-text-secondary font-medium">No tienes posts guardados</p>
          <p className="text-sm text-text-muted mt-1">
            Guarda posts interesantes para verlos más tarde con el icono 🔖
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post as any}
              currentUserId={session.user.id}
            />
          ))}
        </div>
      )}
    </main>
  )
}
