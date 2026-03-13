'use client'

import { useState, useTransition } from 'react'
import { CommentList } from './CommentList'
import { getAvatarUrl } from '@/lib/utils'
import { addComment } from '@/lib/actions/posts'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'

interface CommentsWrapperProps {
  postId: string
  initialComments: any[]
}

export function CommentsWrapper({ postId, initialComments }: CommentsWrapperProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState(initialComments)
  const [content, setContent] = useState('')
  const [isPending, startTransition] = useTransition()

  const avatar = session?.user?.image ?? getAvatarUrl((session?.user as any)?.username ?? 'anon')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    startTransition(async () => {
      try {
        const result = await addComment({ content: content.trim(), postId })
        setContent('')
        // Añadir el nuevo comentario al estado local al instante
        const newComment = {
          id: result.id,
          content: result.content,
          createdAt: result.createdAt,
          parentId: null,
          author: {
            id: (session?.user as any)?.id,
            username: (session?.user as any)?.username ?? '',
            name: session?.user?.name ?? null,
            image: session?.user?.image ?? null,
          },
          replies: [],
        }
        setComments(prev => [newComment, ...prev])
        toast.success('Comentario publicado')
      } catch (err: any) {
        toast.error(err.message ?? 'Error al comentar')
      }
    })
  }

  return (
    <div>
      {/* Form para comentar el post */}
      {session ? (
        <form onSubmit={handleSubmit} className="flex gap-2.5 sm:gap-3 items-start mb-8">
          <img src={avatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0 border border-white/10" />
          <div className="flex-1 relative">
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="¿Qué piensas?"
              className="input min-h-[44px] h-[44px] py-2.5 px-4 pr-12 resize-none text-sm transition-all focus:h-24 custom-scrollbar w-full"
            />
            <button
              type="submit"
              disabled={!content.trim() || isPending}
              className="absolute right-2 bottom-1.5 p-1.5 text-brand-400 hover:text-brand-300 disabled:opacity-30 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        <div className="card p-4 text-center mb-8 border-dashed">
          <p className="text-sm text-text-muted">
            <Link href="/auth/login" className="text-brand-400 font-bold hover:underline">
              Inicia sesión
            </Link>{' '}para comentar
          </p>
        </div>
      )}

      {/* Lista de comentarios con threads */}
      <CommentList comments={comments} postId={postId} />
    </div>
  )
}
