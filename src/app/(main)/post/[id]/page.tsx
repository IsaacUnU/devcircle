import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { PostCard } from '@/components/post/PostCard'
import { CommentForm } from '@/components/post/CommentForm'
import { CommentList } from '@/components/post/CommentList'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

interface Props {
    params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const post = await db.post.findUnique({ where: { id: params.id } })
    if (!post) return { title: 'Post no encontrado' }
    return {
        title: `Post de ${params.id}`,
        description: post.content.substring(0, 160),
    }
}

export default async function PostDetailPage({ params }: Props) {
    const session = await auth()
    const post = await db.post.findUnique({
        where: { id: params.id },
        include: {
            author: { select: { id: true, username: true, name: true, image: true } },
            tags: { include: { tag: { select: { name: true } } } },
            _count: { select: { likes: true, comments: true } },
            likes: { where: { userId: session?.user?.id ?? '' }, select: { id: true } },
            bookmarks: { where: { userId: session?.user?.id ?? '' }, select: { id: true } },
            comments: {
                include: { author: { select: { id: true, username: true, name: true, image: true } } },
                orderBy: { createdAt: 'desc' },
            },
        },
    })

    if (!post) notFound()

    return (
        <main className="flex-1 max-w-2xl px-6 py-6 border-x border-surface-border min-h-screen">
            <div className="flex items-center gap-2 mb-6">
                <Link href="/feed" className="btn-ghost p-1.5 -ml-2">
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-lg font-bold text-text-primary">Post</h1>
            </div>

            <PostCard post={post as any} currentUserId={session?.user?.id} />

            {/* Comments section */}
            <div className="mt-8">
                <h2 className="text-lg font-bold text-text-primary mb-6">Comentarios</h2>

                {session ? (
                    <div className="mb-8">
                        <CommentForm
                            postId={post.id}
                            userImage={session.user.image}
                            username={session.user.username}
                        />
                    </div>
                ) : (
                    <div className="card p-4 text-center mb-8 border-dashed">
                        <p className="text-sm text-text-muted">
                            <Link href="/auth/login" className="text-brand-400 font-bold hover:underline">Inicia sesión</Link> para comentar
                        </p>
                    </div>
                )}

                <CommentList comments={post.comments as any} />
            </div>
        </main>
    )
}
