'use client'

import Link from 'next/link'
import { cn, getAvatarUrl, timeAgo } from '@/lib/utils'
import { useState } from 'react'
import { Search, Edit } from 'lucide-react'
import { NewMessageModal } from './NewMessageModal'

interface ConversationUser {
  id: string
  username: string
  name: string | null
  image: string | null
}

interface ConversationItemData {
  id: string
  userAId: string
  userBId: string
  userA: ConversationUser
  userB: ConversationUser
  lastMsgAt: Date
  messages: Array<{
    content: string
    createdAt: Date
    read: boolean
    senderId: string
  }>
}

interface Props {
  conversations: ConversationItemData[]
  currentUserId: string
  activeId?: string
}

export function ConversationList({ conversations, currentUserId, activeId }: Props) {
  const [filter, setFilter] = useState('')
  const [showNewMessage, setShowNewMessage] = useState(false)

  const filtered = conversations.filter(c => {
    const other = c.userAId === currentUserId ? c.userB : c.userA
    const q = filter.toLowerCase()
    return (
      other.username.toLowerCase().includes(q) ||
      (other.name?.toLowerCase().includes(q) ?? false)
    )
  })

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Search + new */}
      <div className="p-3 flex gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-surface-hover rounded-xl">
          <Search className="w-4 h-4 text-text-muted shrink-0" />
          <input
            type="text"
            placeholder="Buscar conversación..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none text-text-primary placeholder:text-text-muted"
          />
        </div>
        <button
          onClick={() => setShowNewMessage(true)}
          className="w-9 h-9 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 flex items-center justify-center text-brand-400 transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-text-muted py-8">
            {filter ? 'Sin resultados' : 'Sin conversaciones aún'}
          </p>
        ) : (
          filtered.map(conv => {
            const other = conv.userAId === currentUserId ? conv.userB : conv.userA
            const lastMsg = conv.messages[0]
            const unread = lastMsg && !lastMsg.read && lastMsg.senderId !== currentUserId

            return (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 hover:bg-surface-hover transition-colors border-b border-surface-border/50',
                  activeId === conv.id && 'bg-brand-500/5 border-l-2 border-l-brand-500'
                )}
              >
                <div className="relative shrink-0">
                  <img
                    src={other.image ?? getAvatarUrl(other.username)}
                    alt=""
                    className="w-10 h-10 avatar object-cover shadow-sm"
                  />
                  {unread && (
                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-brand-500 border-2 border-surface" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className={cn(
                      'text-sm truncate',
                      unread ? 'font-bold text-text-primary' : 'font-medium text-text-primary'
                    )}>
                      {other.name ?? other.username}
                    </p>
                    {lastMsg && (
                      <span className="text-xs text-text-muted shrink-0">
                        {timeAgo(lastMsg.createdAt)}
                      </span>
                    )}
                  </div>
                  {lastMsg && (
                    <p className={cn(
                      'text-xs truncate mt-0.5',
                      unread ? 'text-text-primary font-medium' : 'text-text-muted'
                    )}>
                      {lastMsg.senderId === currentUserId ? 'Tú: ' : ''}{lastMsg.content}
                    </p>
                  )}
                </div>
              </Link>
            )
          })
        )}
      </div>

      {showNewMessage && (
        <NewMessageModal onClose={() => setShowNewMessage(false)} currentUserId={currentUserId} />
      )}
    </div>
  )
}
