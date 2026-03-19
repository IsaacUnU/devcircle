import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { PostCard } from '@/components/post/PostCard'
import { CommentsWrapper } from '@/components/post/CommentsWrapper'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await db.post.findUnique({ where: { id: params.id } })
  if (!post) return { title: 'Post no encontrado' }
  return { title: `Post · Devora`, description: post.content.substring(0, 160) }
}

export default async function PostDetailPage({ params }: Props) {
  const session = await auth()

  const post = await db.post.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { id: true, username: true, name: true, image: true } },
      tags:   { include: { tag: { select: { name: true } } } },
      _count: { select: { likes: true, comments: true } },
      likes:     { where: { userId: session?.user?.id ?? '' }, select: { id: true } },
      bookmarks: { where: { userId: session?.user?.id ?? '' }, select: { id: true } },
      comments: {
        where: { parentId: null },
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, username: true, name: true, image: true } },
          replies: {
            orderBy: { createdAt: 'asc' },
            include: {
              author: { select: { id: true, username: true, name: true, image: true } },
            },
          },
        },
      },
    },
  })

  if (!post) notFound()

  return (
    <main className="flex-1 max-w-2xl lg:max-w-3xl xl:max-w-2xl px-4 sm:px-6 py-6 border-x border-surface-border min-h-screen">
      {/* Cabecera */}
      <div className="flex items-center gap-2 mb-6">
        <Link href="/feed" className="btn-ghost p-1.5 -ml-2">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold text-text-primary">Post</h1>
      </div>

      <PostCard post={post as any} currentUserId={session?.user?.id} />

      {/* Sección de comentarios — totalmente client-side */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-text-primary mb-6">
          Comentarios
          {post._count.comments > 0 && (
            <span className="ml-2 text-sm font-normal text-text-muted">({post._count.comments})</span>
          )}
        </h2>

        <CommentsWrapper
          postId={post.id}
          initialComments={post.comments as any}
        />
      </div>
    </main>
  )
}
