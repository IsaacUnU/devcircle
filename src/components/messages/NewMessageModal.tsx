'use client'

import { useState, useEffect } from 'react'
import { Search, X, MessageSquarePlus } from 'lucide-react'
import { getAvatarUrl } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { createOrGetConversation } from '@/lib/actions/messages'

interface Props {
  onClose: () => void
  currentUserId: string
}

export function NewMessageModal({ onClose, currentUserId }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => {
    if (!query.trim()) { setUsers([]); return }
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&tab=users`)
        const data = await res.json()
        setUsers(data.users.filter((u: any) => u.id !== currentUserId))
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [query, currentUserId])

  const startChat = async (userId: string) => {
    const convId = await createOrGetConversation(userId)
    router.push(`/messages/${convId}`)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface border border-surface-border rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="w-5 h-5 text-brand-400" />
            <h2 className="font-bold text-text-primary">Nuevo mensaje</h2>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-surface-hover rounded-xl mb-4">
            <Search className="w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar un dev..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
              className="flex-1 bg-transparent text-sm outline-none text-text-primary placeholder:text-text-muted"
            />
          </div>

          <div className="space-y-1 max-h-64 overflow-y-auto">
            {loading ? (
              <p className="text-center text-sm text-text-muted py-4">Buscando...</p>
            ) : users.length > 0 ? (
              users.map(user => (
                <button
                  key={user.id}
                  onClick={() => startChat(user.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-hover transition-colors text-left"
                >
                  <img
                    src={user.image ?? getAvatarUrl(user.username)}
                    alt=""
                    className="w-9 h-9 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-medium text-text-primary">{user.name ?? user.username}</p>
                    <p className="text-xs text-text-muted">@{user.username}</p>
                  </div>
                </button>
              ))
            ) : query ? (
              <p className="text-center text-sm text-text-muted py-4">Sin resultados</p>
            ) : (
              <p className="text-center text-sm text-text-muted py-4">Escribe para buscar devs</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
