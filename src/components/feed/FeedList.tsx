'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { fetchMoreFeed } from '@/lib/actions/feed'
import { PostCard } from '@/components/post/PostCard'
import { Sparkles, Loader2 } from 'lucide-react'

interface FeedListProps {
    initialPosts: any[]
    initialHasMore: boolean
    currentUserId?: string
}

export function FeedList({ initialPosts, initialHasMore, currentUserId }: FeedListProps) {
    const [posts, setPosts] = useState(initialPosts)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(initialHasMore)
    const [isLoading, setIsLoading] = useState(false)
    const loaderRef = useRef<HTMLDivElement>(null)

    // Refs para evitar stale closures en el observer
    const isLoadingRef = useRef(false)
    const hasMoreRef = useRef(initialHasMore)
    const pageRef = useRef(1)

    const loadMore = useCallback(async () => {
        if (isLoadingRef.current || !hasMoreRef.current) return
        isLoadingRef.current = true
        setIsLoading(true)
        try {
            const nextPage = pageRef.current + 1
            const { posts: newPosts, hasMore: more } = await fetchMoreFeed(nextPage)
            setPosts(prev => [...prev, ...newPosts])
            pageRef.current = nextPage
            hasMoreRef.current = more
            setPage(nextPage)
            setHasMore(more)
        } catch (error) {
            console.error('Error loading more posts:', error)
        } finally {
            isLoadingRef.current = false
            setIsLoading(false)
        }
    }, [])

    // Observer estable — no se reconecta en cada carga
    useEffect(() => {
        const el = loaderRef.current
        if (!el) return

        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) loadMore()
            },
            { threshold: 0.1, rootMargin: '400px' }
        )

        observer.observe(el)
        return () => observer.disconnect()
    }, [loadMore]) // loadMore es estable gracias a useCallback sin deps que cambien

    if (posts.length === 0) {
        return (
            <div className="card p-16 text-center shadow-xl">
                <div className="w-16 h-16 bg-surface-hover rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                    <Sparkles className="w-8 h-8 text-text-muted opacity-30" />
                </div>
                <p className="text-text-primary font-bold text-lg mb-2">Tu feed está muy tranquilo</p>
                <p className="text-sm text-text-muted max-w-xs mx-auto">
                    Sigue a otros developers de la comunidad para ver sus proyectos y aprendizajes aquí.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {posts.map(post => (
                <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={currentUserId}
                />
            ))}

            {/* Sentinel — siempre en el DOM mientras haya más páginas */}
            {hasMore && (
                <div ref={loaderRef} className="py-8 flex justify-center">
                    {isLoading && <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />}
                </div>
            )}

            {!hasMore && posts.length > 0 && (
                <div className="py-8 text-center text-sm text-text-muted font-medium">
                    Has llegado al final del feed ✨
                </div>
            )}
        </div>
    )
}
