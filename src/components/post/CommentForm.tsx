'use client'

import { useState, useTransition } from 'react'
import { Send } from 'lucide-react'
import { addComment } from '@/lib/actions/posts'
import { getAvatarUrl } from '@/lib/utils'
import toast from 'react-hot-toast'

interface CommentFormProps {
    postId: string
    userImage?: string | null
    username?: string | null
    parentId?: string
    placeholder?: string
}

export function CommentForm({ postId, userImage, username, parentId, placeholder }: CommentFormProps) {
    const [content, setContent] = useState('')
    const [isPending, startTransition] = useTransition()

    const avatar = userImage ?? (username ? getAvatarUrl(username) : getAvatarUrl('anonymous'))

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return

        startTransition(async () => {
            try {
                await addComment({
                    content: content.trim(),
                    postId,
                    parentId,
                })
                setContent('')
                toast.success('Comentario publicado')
            } catch (err: any) {
                toast.error(err.message ?? 'Error al comentar')
            }
        })
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-3 items-start group">
            <img src={avatar} alt="" className="w-9 h-9 avatar shrink-0" />
            <div className="flex-1 relative">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={placeholder ?? "¿Qué piensas?"}
                    className="input min-h-[44px] h-[44px] py-2.5 px-4 pr-12 resize-none text-sm transition-all focus:h-24 custom-scrollbar"
                />
                <button
                    type="submit"
                    disabled={!content.trim() || isPending}
                    className="absolute right-2 bottom-1.5 p-1.5 text-brand-400 hover:text-brand-300 disabled:opacity-30 disabled:hover:text-brand-400 transition-colors"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </form>
    )
}
