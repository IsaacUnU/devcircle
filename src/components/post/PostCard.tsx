'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition, useRef, useEffect } from 'react'
import { Heart, MessageCircle, Bookmark, Share2, Code, MoreHorizontal, Trash2, Globe2 } from 'lucide-react'
import { formatCount, timeAgo, cn, getAvatarUrl } from '@/lib/utils'
import { toggleLike, toggleBookmark, deletePost } from '@/lib/actions/posts'
import type { PostWithMeta } from '@/types'
import { RichText } from '@/components/ui/RichText'
import { translateText } from '@/lib/actions/translate'
import { useTranslation } from '@/lib/i18n'
import toast from 'react-hot-toast'

interface PostCardProps {
  post: PostWithMeta
  currentUserId?: string
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [liked, setLiked] = useState(() => (post.likes?.length ?? 0) > 0)
  const [likeCount, setLikeCount] = useState(post._count.likes)
  const [bookmarked, setBookmarked] = useState(() => (post.bookmarks?.length ?? 0) > 0)
  const [showCode, setShowCode] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const [translatedText, setTranslatedText] = useState<string | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { dict, language: uiLanguage } = useTranslation()
  const tPost = (dict as any).post

  const isOwner = currentUserId === post.author.id
  const authorImage = post.author.image ?? getAvatarUrl(post.author.username)

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    if (showMenu) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showMenu])

  function handleLike() {
    if (!currentUserId) { toast.error(tPost.toasts.login_like); return }
    const wasLiked = liked
    setLiked(!wasLiked)
    setLikeCount(prev => wasLiked ? prev - 1 : prev + 1)
    startTransition(async () => {
      try {
        await toggleLike(post.id)
      } catch {
        setLiked(wasLiked)
        setLikeCount(prev => wasLiked ? prev + 1 : prev - 1)
      }
    })
  }

  function handleBookmark() {
    if (!currentUserId) { toast.error(tPost.toasts.login_save); return }
    setBookmarked(prev => !prev)
    startTransition(async () => {
      try {
        await toggleBookmark(post.id)
        toast.success(bookmarked ? tPost.toasts.unsaved : tPost.toasts.saved)
      } catch {
        setBookmarked(prev => !prev)
      }
    })
  }

  function handleShare() {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`)
    toast.success(tPost.toasts.link_copied)
  }

  function handleDelete() {
    if (!confirm(tPost.delete_confirm)) return
    setShowMenu(false)
    startTransition(async () => {
      try {
        await deletePost(post.id)
        setDeleted(true)
        toast.success(tPost.toasts.deleted)
      } catch (err: any) {
        toast.error(err.message ?? tPost.toasts.delete_error)
      }
    })
  }
  
  async function handleTranslate(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (translatedText) {
      setTranslatedText(null)
      return
    }

    setIsTranslating(true)
    try {
      const res = await translateText(post.content, uiLanguage)
      setTranslatedText(res)
    } catch (err) {
      toast.error(tPost.toasts.translate_error)
    } finally {
      setIsTranslating(false)
    }
  }

  if (deleted) return null

  return (
    <article className="card p-4 sm:p-5 hover:border-surface-hover transition-colors animate-fade-in">
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

        {/* Owner menu */}
        {isOwner && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(prev => !prev)}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-all"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 z-20 w-44 py-1 rounded-xl bg-surface border border-surface-border shadow-xl animate-fade-in overflow-hidden">
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  {tPost.delete_button}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <Link href={`/post/${post.id}`} className="block group/content">
        <div className="text-text-primary text-[15px] leading-relaxed mb-1 whitespace-pre-line group-hover/content:text-text-primary/90 transition-colors">
          <RichText text={translatedText ?? post.content} />
        </div>
      </Link>
      
      {/* Botón de traducir */}
      <button
        onClick={handleTranslate}
        disabled={isTranslating}
        className="text-[11px] font-bold text-brand-400 hover:text-brand-300 transition-colors mb-4 flex items-center gap-1 group/translate"
      >
        <Globe2 className="w-3 h-3 group-hover/translate:rotate-12 transition-transform" />
        {isTranslating ? tPost.translating : (translatedText ? tPost.see_original : tPost.translate)}
      </button>

      {/* Imagen del post */}
      {post.image && (
        <Link href={`/post/${post.id}`} className="block mb-3">
          <img
            src={post.image}
            alt={tPost.image_alt}
            className="w-full rounded-xl object-cover max-h-80 border border-surface-border hover:opacity-95 transition-opacity"
          />
        </Link>
      )}

      {/* Code snippet toggle */}
      {post.codeSnip && (
        <div className="mb-3">
          <button
            onClick={() => setShowCode(prev => !prev)}
            className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 transition-colors mb-2"
          >
            <Code className="w-3.5 h-3.5" />
            {showCode ? tPost.hide_code : `${tPost.show_code} ${post.language ? `(${post.language})` : ''}`}
          </button>
          {showCode && (
            <pre className="text-xs animate-slide-up">
              <code>{post.codeSnip}</code>
            </pre>
          )}
        </div>
      )}

      {/* Tags — clickable */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {post.tags.map(({ tag }) => (
            <Link
              key={tag.name}
              href={`/search?q=%23${encodeURIComponent(tag.name)}`}
              className="tag hover:bg-brand-500/20 hover:text-brand-300 transition-colors cursor-pointer"
            >
              #{tag.name}
            </Link>
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
