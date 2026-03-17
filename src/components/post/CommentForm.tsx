'use client'

import { useState, useTransition } from 'react'
import { Send } from 'lucide-react'
import { addComment } from '@/lib/actions/posts'
import { getAvatarUrl } from '@/lib/utils'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { MentionTextarea } from '@/components/ui/MentionTextarea'
import { useTranslation } from '@/lib/i18n'

interface CommentFormProps {
  postId: string
  userImage?: string | null
  username?: string | null
  parentId?: string
  placeholder?: string
  onSuccess?: () => void
  compact?: boolean
}

export function CommentForm({
  postId, userImage, username, parentId, placeholder, onSuccess, compact
}: CommentFormProps) {
  const { dict } = useTranslation()
  const t = (dict as any).comments
  const [content, setContent] = useState('')
  const [isPending, startTransition] = useTransition()

  const avatar = userImage ?? (username ? getAvatarUrl(username) : getAvatarUrl('anonymous'))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    startTransition(async () => {
      try {
        await addComment({ content: content.trim(), postId, parentId })
        setContent('')
        toast.success(parentId ? t.toasts.reply_published : t.toasts.comment_published)
        onSuccess?.()
      } catch (err: any) {
        toast.error(err.message ?? (parentId ? t.toasts.error_replying : t.toasts.error_commenting))
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className={cn('flex gap-2 sm:gap-3 items-start', compact && 'gap-2')}>
      <img
        src={avatar}
        alt=""
        className={cn('rounded-full object-cover shrink-0 border border-white/10', compact ? 'w-7 h-7' : 'w-9 h-9')}
      />
      {/* MentionTextarea es el único "relative" — gestiona dropdown y botón Send */}
      <MentionTextarea
        value={content}
        onChange={setContent}
        placeholder={placeholder ?? t.placeholder}
        className={cn(
          'input resize-none text-sm transition-all pr-10 custom-scrollbar w-full',
          compact
            ? 'min-h-[36px] h-[36px] py-2 px-3 focus:h-20'
            : 'min-h-[44px] h-[44px] py-2.5 px-4 focus:h-24'
        )}
        action={
          <button
            type="submit"
            disabled={!content.trim() || isPending}
            className="p-1.5 text-brand-400 hover:text-brand-300 disabled:opacity-30 transition-colors"
          >
            <Send className={cn(compact ? 'w-3.5 h-3.5' : 'w-4 h-4')} />
          </button>
        }
      />
    </form>
  )
}
