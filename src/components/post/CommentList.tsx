'use client'

import { useState, useEffect, useRef } from 'react'
import { timeAgo, getAvatarUrl, cn } from '@/lib/utils'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Reply, MessageCircle, Send, Trash2, Heart, Flame, Zap, Lightbulb, Rocket, Eye, Plus } from 'lucide-react'
import { addComment, deleteComment } from '@/lib/actions/posts'
import { toggleCommentReaction, ReactionType } from '@/lib/actions/reactions'
import toast from 'react-hot-toast'
import { MentionTextarea } from '@/components/ui/MentionTextarea'
import { RichText } from '@/components/ui/RichText'
import { useTranslation } from '@/lib/i18n'

// ── CommentReactions ─────────────────────────────────────────────────────────
const COMMENT_REACTIONS: Record<ReactionType, { icon: React.ElementType; color: string }> = {
  HEART:  { icon: Heart,     color: 'hover:text-rose-400'   },
  FIRE:   { icon: Flame,     color: 'hover:text-orange-400' },
  ZAPPER: { icon: Zap,       color: 'hover:text-yellow-400' },
  BULB:   { icon: Lightbulb, color: 'hover:text-sky-400'    },
  ROCKET: { icon: Rocket,    color: 'hover:text-brand-400'  },
  EYES:   { icon: Eye,       color: 'hover:text-purple-400' },
}

function CommentReactionPicker({
  commentId, currentUserId,
}: {
  commentId: string
  currentUserId?: string
}) {
  const [open, setOpen]           = useState(false)
  const [myReaction, setMyReaction] = useState<ReactionType | null>(null)
  const [counts, setCounts]       = useState<Record<string, number>>({})
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleReact(type: ReactionType) {
    if (!currentUserId) { toast.error('Inicia sesión para reaccionar'); return }
    setOpen(false)
    const wasMe = myReaction === type
    const prev  = myReaction
    setMyReaction(wasMe ? null : type)
    setCounts(c => {
      const next = { ...c }
      if (prev)  next[prev] = Math.max(0, (next[prev] ?? 0) - 1)
      if (!wasMe) next[type] = (next[type] ?? 0) + 1
      return next
    })
    try {
      await toggleCommentReaction(commentId, type)
    } catch {
      setMyReaction(prev)
      toast.error('Error al reaccionar')
    }
  }

  const total = Object.values(counts).reduce((s, v) => s + v, 0)
  const MyIcon = myReaction ? COMMENT_REACTIONS[myReaction].icon : null

  return (
    <div className="relative flex items-center gap-1" ref={pickerRef}>
      {/* Pills de reacciones activas */}
      {Object.entries(counts).filter(([, v]) => v > 0).map(([type, count]) => {
        const cfg  = COMMENT_REACTIONS[type as ReactionType]
        const Icon = cfg.icon
        const isMe = myReaction === type
        return (
          <button key={type} onClick={() => handleReact(type as ReactionType)}
            className={cn(
              'flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] border transition-all',
              isMe ? 'text-brand-400 border-brand-500/40 bg-brand-500/10' : 'text-text-muted border-surface-border bg-surface-hover'
            )}
          >
            <Icon className="w-2.5 h-2.5" />
            <span>{count}</span>
          </button>
        )
      })}

      {/* Botón abrir picker */}
      <div className="relative">
        <button onClick={() => setOpen(p => !p)}
          className={cn(
            'flex items-center justify-center w-6 h-6 rounded-md transition-all text-text-muted',
            open ? 'bg-surface-hover text-text-primary' : 'hover:bg-surface-hover opacity-0 group-hover:opacity-100'
          )}
        >
          {MyIcon ? <MyIcon className="w-3 h-3 fill-current text-brand-400" /> : <Plus className="w-3 h-3" />}
        </button>

        {open && (
          <div className="absolute bottom-full left-0 mb-1.5 z-50 animate-fade-in">
            <div className="flex items-center gap-0.5 p-1 rounded-lg bg-surface-card border border-surface-border shadow-xl">
              {(Object.keys(COMMENT_REACTIONS) as ReactionType[]).map(type => {
                const cfg  = COMMENT_REACTIONS[type]
                const Icon = cfg.icon
                return (
                  <button key={type} onClick={() => handleReact(type)} title={type.toLowerCase()}
                    className={cn(
                      'flex items-center justify-center w-7 h-7 rounded-md transition-all hover:scale-110 text-text-muted',
                      cfg.color,
                      myReaction === type && 'fill-current text-brand-400'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface Author {
  id?: string
  username: string
  name: string | null
  image: string | null
}

interface CommentData {
  id: string
  content: string
  createdAt: Date
  parentId?: string | null
  author: Author
  replies?: CommentData[]
}

// ── InlineReplyForm ────────────────────────────────────────────────────────────
function InlineReplyForm({
  postId, parentId, replyingTo, onSuccess, onCancel,
}: {
  postId: string
  parentId: string
  replyingTo: string
  onSuccess: (newReply: CommentData) => void
  onCancel: () => void
}) {
  const { dict } = useTranslation()
  const t = (dict as any).comments
  const { data: session } = useSession()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [freshAvatar, setFreshAvatar] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.user?.id) return
    fetch('/api/user/avatar')
      .then(r => r.json())
      .then(d => { if (d.image) setFreshAvatar(d.image) })
      .catch(() => { })
  }, [session?.user?.id])

  const avatar = freshAvatar ?? session?.user?.image ?? getAvatarUrl((session?.user as any)?.username ?? '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || loading) return
    setLoading(true)
    try {
      const result = await addComment({ content: content.trim(), postId, parentId })
      setContent('')
      onSuccess({
        id: result.id,
        content: result.content,
        createdAt: result.createdAt,
        parentId,
        author: {
          id: (session?.user as any)?.id,
          username: (session?.user as any)?.username ?? '',
          name: session?.user?.name ?? null,
          image: freshAvatar ?? session?.user?.image ?? null,
        },
        replies: [],
      })
    } catch (err: any) {
      toast.error(err.message ?? t.toasts.error_replying)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2 mt-3 animate-fade-in items-start">
      <img src={avatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0 mt-1 border border-white/10" />
      <form onSubmit={handleSubmit} className="flex-1">
        {/* MentionTextarea gestiona el relative, el dropdown y el Send */}
        <MentionTextarea
          value={content}
          onChange={setContent}
          placeholder={(t.reply_placeholder || 'Responder a @{username}...').replace('{username}', replyingTo)}
          autoFocus
          className="input w-full resize-none text-sm py-2 px-3 pr-10 min-h-[36px] h-[36px] focus:h-20 transition-all custom-scrollbar"
          action={
            <button
              type="submit"
              disabled={!content.trim() || loading}
              className="p-1.5 text-brand-400 hover:text-brand-300 disabled:opacity-30 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          }
        />
      </form>
      <button
        onClick={onCancel}
        className="text-xs text-text-muted hover:text-text-primary mt-2 transition-colors shrink-0"
      >
        ✕
      </button>
    </div>
  )
}

// ── CommentItem ────────────────────────────────────────────────────────────────
function CommentItem({
  comment, postId, depth = 0, onReplyAdded, onDeleted,
}: {
  comment: CommentData
  postId: string
  depth?: number
  onReplyAdded?: (parentId: string, reply: CommentData) => void
  onDeleted?: (commentId: string, parentId?: string | null) => void
}) {
  const { dict } = useTranslation()
  const t = (dict as any).comments
  const { data: session } = useSession()
  const [replying, setReplying] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const avatar = comment.author.image ?? getAvatarUrl(comment.author.username)
  const isNested = depth > 0
  const isOwner = session?.user && (session.user as any).id === comment.author.id
  const hasReplies = !isNested && comment.replies && comment.replies.length > 0

  const handleReplySuccess = (newReply: CommentData) => {
    setReplying(false)
    onReplyAdded?.(comment.id, newReply)
  }

  const handleDelete = async () => {
    if (!confirm(t.delete_confirm)) return
    setDeleting(true)
    try {
      await deleteComment(comment.id)
      toast.success(t.toasts.deleted)
      onDeleted?.(comment.id, comment.parentId)
    } catch (err: any) {
      toast.error(err.message ?? t.toasts.error_deleting)
      setDeleting(false)
    }
  }

  if (deleting) return null

  return (
    <div className={cn('animate-fade-in flex gap-2.5 sm:gap-3 py-3 group', isNested && 'pl-9 sm:pl-11')}>

      {/* Columna izquierda: avatar + línea */}
      {!isNested ? (
        <div className="flex flex-col items-center shrink-0 w-8 sm:w-9">
          <Link href={`/profile/${comment.author.username}`}>
            <img src={avatar} alt="" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-white/10" />
          </Link>
          {hasReplies && <div className="w-0.5 bg-surface-border mt-1.5 flex-1" />}
        </div>
      ) : (
        <Link href={`/profile/${comment.author.username}`} className="shrink-0 self-start mt-3">
          <img src={avatar} alt="" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-white/10" />
        </Link>
      )}

      {/* Columna derecha: contenido + replies */}
      <div className="flex-1 min-w-0 pb-3">
        {/* Header */}
        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
          <Link
            href={`/profile/${comment.author.username}`}
            className="font-bold text-text-primary text-sm hover:underline leading-none"
          >
            {comment.author.name ?? comment.author.username}
          </Link>
          <span className="text-text-muted text-xs">@{comment.author.username}</span>
          <span className="text-text-muted text-xs opacity-40">·</span>
          <span className="text-text-muted text-xs">{timeAgo(comment.createdAt)}</span>

          {/* Botón eliminar — solo owner, aparece en hover */}
            {isOwner && (
              <button
                onClick={handleDelete}
                title={t.delete_button}
                className="ml-auto opacity-0 group-hover:opacity-100 p-1 rounded text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
        </div>

        {/* Texto */}
        <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">
          <RichText text={comment.content} />
        </p>

        {/* Reacciones + Responder */}
        <div className="flex items-center gap-3 mt-2">
          <CommentReactionPicker
            commentId={comment.id}
            currentUserId={session?.user ? (session.user as any).id : undefined}
          />

          {session && !isNested && (
            <button
              onClick={() => setReplying(r => !r)}
              className={cn(
                'flex items-center gap-1 text-xs py-0.5 transition-colors',
                replying
                  ? 'text-brand-400'
                  : 'text-text-muted hover:text-brand-400 opacity-0 group-hover:opacity-100'
              )}
            >
              <Reply className="w-3.5 h-3.5" />
              {t.reply_button}
            </button>
          )}
        </div>

        {/* InlineReplyForm */}
        {replying && session && (
          <InlineReplyForm
            postId={postId}
            parentId={comment.id}
            replyingTo={comment.author.username}
            onSuccess={handleReplySuccess}
            onCancel={() => setReplying(false)}
          />
        )}

        {/* Replies anidadas */}
        {hasReplies && (
          <div className="mt-1">
            {comment.replies!.map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                postId={postId}
                depth={1}
                onDeleted={onDeleted}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── CommentList principal ──────────────────────────────────────────────────────
interface CommentListProps {
  comments: CommentData[]
  postId: string
}

export function CommentList({ comments: initialComments, postId }: CommentListProps) {
  const { dict } = useTranslation()
  const t = (dict as any).comments
  const [threads, setThreads] = useState<CommentData[]>(() => {
    const roots = initialComments.filter(c => !c.parentId)
    const repliesMap: Record<string, CommentData[]> = {}
    initialComments.filter(c => c.parentId).forEach(c => {
      const pid = c.parentId!
      if (!repliesMap[pid]) repliesMap[pid] = []
      repliesMap[pid].push(c)
    })
    return roots.map(c => ({
      ...c,
      replies: [
        ...(c.replies ?? []),
        ...(repliesMap[c.id] ?? []),
      ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    }))
  })

  const handleReplyAdded = (parentId: string, newReply: CommentData) => {
    setThreads(prev => prev.map(thread => {
      if (thread.id !== parentId) return thread
      return { ...thread, replies: [...(thread.replies ?? []), newReply] }
    }))
  }

  // Elimina un comentario (raíz o reply) del estado local
  const handleDeleted = (commentId: string, parentId?: string | null) => {
    if (parentId) {
      // Es una reply — quítala de las replies del padre
      setThreads(prev => prev.map(thread => ({
        ...thread,
        replies: (thread.replies ?? []).filter(r => r.id !== commentId),
      })))
    } else {
      // Es un comentario raíz
      setThreads(prev => prev.filter(t => t.id !== commentId))
    }
  }

  if (threads.length === 0) {
    return (
      <div className="py-12 text-center border-t border-surface-border">
        <MessageCircle className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-20" />
        <p className="text-text-muted text-sm italic">{t.empty_state}</p>
      </div>
    )
  }

  return (
    <div className="border-t border-surface-border mt-4 divide-y divide-surface-border">
      {threads.map(comment => (
        <CommentItem
          key={comment.id}
          comment={comment}
          postId={postId}
          onReplyAdded={handleReplyAdded}
          onDeleted={handleDeleted}
        />
      ))}
    </div>
  )
}
