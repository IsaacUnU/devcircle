'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { Heart, MessageCircle, Bookmark, Share2, Code } from 'lucide-react'
import { formatCount, timeAgo, cn, getAvatarUrl } from '@/lib/utils'
import { toggleLike, toggleBookmark } from '@/lib/actions/posts'
import type { PostWithMeta } from '@/types'
import toast from 'react-hot-toast'

interface PostCardProps {
  post: PostWithMeta
  currentUserId?: string
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const [isPending, startTransition] = useTransition()
  const [liked, setLiked] = useState(() => (post.likes?.length ?? 0) > 0)
  const [likeCount, setLikeCount] = useState(post._count.likes)
  const [bookmarked, setBookmarked] = useState(() => (post.bookmarks?.length ?? 0) > 0)
  const [showCode, setShowCode] = useState(false)

  const authorImage = post.author.image ?? getAvatarUrl(post.author.username)

  function handleLike() {
    if (!currentUserId) { toast.error('Inicia sesión para dar like'); return }
    setLiked(prev => !prev)
    setLikeCount(prev => liked ? prev - 1 : prev + 1)
    startTransition(async () => {
      try {
        await toggleLike(post.id)
      } catch {
        setLiked(prev => !prev)
        setLikeCount(prev => liked ? prev + 1 : prev - 1)
      }
    })
  }

  function handleBookmark() {
    if (!currentUserId) { toast.error('Inicia sesión para guardar'); return }
    setBookmarked(prev => !prev)
    startTransition(async () => {
      try {
        await toggleBookmark(post.id)
        toast.success(bookmarked ? 'Eliminado de guardados' : 'Guardado')
      } catch {
        setBookmarked(prev => !prev)
      }
    })
  }

  function handleShare() {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`)
    toast.success('Enlace copiado')
  }

  return (
    <article className="card p-5 hover:border-surface-hover transition-colors animate-fade-in">
      {/* Author */}
      <div className="flex items-start gap-3 mb-4">
        <Link href={`/profile/${post.author.username}`} className="shrink-0">
          <img
            src={authorImage}
            alt={post.author.name ?? post.author.username}
            className="w-11 h-11 avatar hover:ring-2 hover:ring-brand-500/50 transition-all duration-300 shadow-sm"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link
              href={`/profile/${post.author.username}`}
              className="font-bold text-text-primary hover:text-brand-400 transition-colors text-sm"
            >
              {post.author.name ?? post.author.username}
            </Link>
            <span className="text-text-muted text-[13px]">@{post.author.username}</span>
            <span className="text-text-muted text-xs opacity-50">·</span>
            <time className="text-text-muted text-xs opacity-80">{timeAgo(post.createdAt)}</time>
          </div>
        </div>
      </div>

      {/* Content */}
      <Link href={`/post/${post.id}`} className="block group/content">
        <p className="text-text-primary text-[15px] leading-relaxed mb-4 whitespace-pre-line group-hover/content:text-text-primary/90 transition-colors">
          {post.content}
        </p>
      </Link>

      {/* Code snippet toggle */}
      {post.codeSnip && (
        <div className="mb-3">
          <button
            onClick={() => setShowCode(prev => !prev)}
            className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 transition-colors mb-2"
          >
            <Code className="w-3.5 h-3.5" />
            {showCode ? 'Ocultar código' : `Ver código ${post.language ? `(${post.language})` : ''}`}
          </button>
          {showCode && (
            <pre className="text-xs animate-slide-up">
              <code>{post.codeSnip}</code>
            </pre>
          )}
        </div>
      )}

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {post.tags.map(({ tag }) => (
            <span key={tag.name} className="tag">
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 pt-3 border-t border-surface-border">
        <button
          onClick={handleLike}
          disabled={isPending}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-150',
            liked
              ? 'text-red-400 hover:bg-red-400/10'
              : 'text-text-muted hover:text-red-400 hover:bg-red-400/10'
          )}
        >
          <Heart className={cn('w-4 h-4', liked && 'fill-current')} />
          <span>{formatCount(likeCount)}</span>
        </button>

        <Link
          href={`/post/${post.id}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-text-muted hover:text-brand-400 hover:bg-brand-400/10 transition-all duration-150"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{formatCount(post._count.comments)}</span>
        </Link>

        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={handleBookmark}
            disabled={isPending}
            className={cn(
              'p-2 rounded-lg text-sm transition-all duration-150',
              bookmarked
                ? 'text-brand-400 hover:bg-brand-400/10'
                : 'text-text-muted hover:text-brand-400 hover:bg-brand-400/10'
            )}
          >
            <Bookmark className={cn('w-4 h-4', bookmarked && 'fill-current')} />
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-lg text-text-muted hover:text-text-secondary hover:bg-surface-hover transition-all duration-150"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  )
}
