'use client'

import { timeAgo, getAvatarUrl } from '@/lib/utils'
import Link from 'next/link'

interface Comment {
    id: string
    content: string
    createdAt: Date
    author: {
        username: string
        name: string | null
        image: string | null
    }
}

interface CommentItemProps {
    comment: Comment
}

export function CommentItem({ comment }: CommentItemProps) {
    const avatar = comment.author.image ?? getAvatarUrl(comment.author.username)

    return (
        <div className="flex gap-3 py-4 border-b border-surface-border last:border-0 animate-fade-in">
            <Link href={`/profile/${comment.author.username}`} className="shrink-0">
                <img src={avatar} alt="" className="w-9 h-9 avatar" />
            </Link>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <Link href={`/profile/${comment.author.username}`} className="font-bold text-text-primary text-sm hover:underline">
                        {comment.author.name ?? comment.author.username}
                    </Link>
                    <span className="text-text-muted text-xs">@{comment.author.username}</span>
                    <span className="text-text-muted text-xs opacity-50">·</span>
                    <span className="text-text-muted text-xs">{timeAgo(comment.createdAt)}</span>
                </div>
                <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">
                    {comment.content}
                </p>
            </div>
        </div>
    )
}

interface CommentListProps {
    comments: Comment[]
}

export function CommentList({ comments }: CommentListProps) {
    if (comments.length === 0) {
        return (
            <div className="py-12 text-center border-t border-surface-border">
                <p className="text-text-muted text-sm italic">Sé el primero en comentar...</p>
            </div>
        )
    }

    return (
        <div className="border-t border-surface-border mt-4">
            {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
            ))}
        </div>
    )
}
