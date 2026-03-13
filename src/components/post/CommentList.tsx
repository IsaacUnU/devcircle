'use client'

import { useState } from 'react'
import { timeAgo, getAvatarUrl } from '@/lib/utils'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Reply, MessageCircle } from 'lucide-react'
import { addComment } from '@/lib/actions/posts'
import toast from 'react-hot-toast'
import { Send } from 'lucide-react'

// ── Tipos ────────────────────────────────────────────────────────────────────
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

// ── Mini inline reply form ────────────────────────────────────────────────────
function InlineReplyForm({
  postId, parentId, replyingTo, onSuccess, onCancel,
}: {
  postId: string
  parentId: string
  replyingTo: string
  onSuccess: (newReply: CommentData) => void
  onCancel: () => void
}) {
  const { data: session } = useSession()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const avatar = session?.user?.image ?? getAvatarUrl((session?.user as any)?.username ?? '')

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
          image: session?.user?.image ?? null,
        },
        replies: [],
      })
    } catch (err: any) {
      toast.error(err.message ?? 'Error al responder')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2 mt-3 animate-fade-in">
      <img src={avatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0 mt-1 border border-white/10" />
      <form onSubmit={handleSubmit} className="flex-1 relative">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={`Responder a @${replyingTo}...`}
          autoFocus
          className="input w-full resize-none text-sm py-2 px-3 pr-10 min-h-[36px] h-[36px] focus:h-20 transition-all custom-scrollbar"
        />
        <button
          type="submit"
          disabled={!content.trim() || loading}
          className="absolute right-2 bottom-1.5 p-1.5 text-brand-400 hover:text-brand-300 disabled:opacity-30 transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
      <button onClick={onCancel} className="text-xs text-text-muted hover:text-text-primary mt-2 transition-colors">
        ✕
      </button>
    </div>
  )
}

// ── Componente de un comentario (raíz o reply) ────────────────────────────────
function CommentItem({
  comment, postId, depth = 0, onReplyAdded,
}: {
  comment: CommentData
  postId: string
  depth?: number
  onReplyAdded?: (parentId: string, reply: CommentData) => void
}) {
  const { data: session } = useSession()
  const [replying, setReplying] = useState(false)
  const avatar = comment.author.image ?? getAvatarUrl(comment.author.username)
  const isNested = depth > 0

  const handleReplySuccess = (newReply: CommentData) => {
    setReplying(false)
    onReplyAdded?.(comment.id, newReply)
  }

  return (
    <div className={cn(
      'animate-fade-in',
      isNested && 'ml-9 sm:ml-11 pl-3 sm:pl-4 border-l-2 border-surface-border'
    )}>
      {/* ── Fila principal del comentario ── */}
      <div className="flex gap-2.5 sm:gap-3 py-3 group">
        {/* Línea vertical + avatar */}
        <div className="flex flex-col items-center shrink-0">
          <Link href={`/profile/${comment.author.username}`}>
            <img src={avatar} alt="" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-white/10" />
          </Link>
          {/* Línea que conecta con replies (solo si tiene hijos) */}
          {!isNested && comment.replies && comment.replies.length > 0 && (
            <div className="w-0.5 flex-1 bg-surface-border mt-1 min-h-[8px]" />
          )}
        </div>

        {/* Cuerpo */}
        <div className="flex-1 min-w-0 pb-1">
          {/* Header */}
          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
            <Link href={`/profile/${comment.author.username}`}
              className="font-bold text-text-primary text-sm hover:underline leading-none">
              {comment.author.name ?? comment.author.username}
            </Link>
            <span className="text-text-muted text-xs">@{comment.author.username}</span>
            <span className="text-text-muted text-xs opacity-40">·</span>
            <span className="text-text-muted text-xs">{timeAgo(comment.createdAt)}</span>
          </div>

          {/* Texto */}
          <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">
            {comment.content}
          </p>

          {/* Acción Responder */}
          {session && !isNested && (
            <button
              onClick={() => setReplying(r => !r)}
              className={cn(
                'flex items-center gap-1 text-xs mt-2 py-0.5 transition-colors',
                replying ? 'text-brand-400' : 'text-text-muted hover:text-brand-400 opacity-0 group-hover:opacity-100'
              )}
            >
              <Reply className="w-3.5 h-3.5" />
              Responder
            </button>
          )}

          {/* Form inline de respuesta */}
          {replying && session && (
            <InlineReplyForm
              postId={postId}
              parentId={comment.id}
              replyingTo={comment.author.username}
              onSuccess={handleReplySuccess}
              onCancel={() => setReplying(false)}
            />
          )}
        </div>
      </div>

      {/* ── Replies anidadas ── */}
      {!isNested && comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} postId={postId} depth={1} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── CommentList principal ─────────────────────────────────────────────────────
interface CommentListProps {
  comments: CommentData[]
  postId: string
}

export function CommentList({ comments: initialComments, postId }: CommentListProps) {
  // Estado local para poder añadir replies sin recargar la página
  const [threads, setThreads] = useState<CommentData[]>(() => {
    // Construir árbol: raíces + sus replies ya anidadas desde Prisma
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
        ...(c.replies ?? []),                      // replies ya anidadas por Prisma
        ...(repliesMap[c.id] ?? []),               // replies en array plano (fallback)
      ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    }))
  })

  // Cuando se añade una reply, insertarla en el estado local al instante
  const handleReplyAdded = (parentId: string, newReply: CommentData) => {
    setThreads(prev => prev.map(thread => {
      if (thread.id !== parentId) return thread
      return {
        ...thread,
        replies: [...(thread.replies ?? []), newReply],
      }
    }))
  }

  if (threads.length === 0) {
    return (
      <div className="py-12 text-center border-t border-surface-border">
        <MessageCircle className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-20" />
        <p className="text-text-muted text-sm italic">Sé el primero en comentar...</p>
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
        />
      ))}
    </div>
  )
}
