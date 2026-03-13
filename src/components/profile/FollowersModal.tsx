'use client'

import { useEffect, useState, useCallback } from 'react'
import { X, UserCheck, UserPlus, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toggleFollow } from '@/lib/actions/users'
import { getAvatarUrl, formatCount } from '@/lib/utils'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface UserItem {
  id: string
  username: string
  name: string | null
  image: string | null
  bio: string | null
  reputation: number
  _count: { followers: number; posts: number }
  followers: { id: string }[]   // si el viewer ya le sigue
}

interface FollowersModalProps {
  username: string
  initialTab: 'followers' | 'following'
  followersCount: number
  followingCount: number
  currentUserId?: string
  onClose: () => void
}

export function FollowersModal({
  username, initialTab, followersCount, followingCount, currentUserId, onClose,
}: FollowersModalProps) {
  const [tab, setTab] = useState<'followers' | 'following'>(initialTab)
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [followStates, setFollowStates] = useState<Record<string, boolean>>({})

  const fetchUsers = useCallback(async (t: 'followers' | 'following') => {
    setLoading(true)
    try {
      const res = await fetch(`/api/users/${username}/${t}`)
      const data: UserItem[] = await res.json()
      setUsers(data)
      // Inicializar estados de follow basados en los datos de la API
      const states: Record<string, boolean> = {}
      data.forEach(u => { states[u.id] = (u.followers?.length ?? 0) > 0 })
      setFollowStates(states)
    } catch {
      toast.error('Error cargando usuarios')
    } finally {
      setLoading(false)
    }
  }, [username])

  useEffect(() => { fetchUsers(tab) }, [tab, fetchUsers])

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  async function handleFollow(userId: string) {
    if (!currentUserId) { toast.error('Inicia sesión para seguir'); return }
    const wasFollowing = followStates[userId]
    setFollowStates(prev => ({ ...prev, [userId]: !wasFollowing }))
    try {
      await toggleFollow(userId)
    } catch {
      setFollowStates(prev => ({ ...prev, [userId]: wasFollowing }))
      toast.error('Error al actualizar follow')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm sm:backdrop-blur-md animate-fade-in" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md bg-surface sm:bg-transparent animate-slide-up mt-auto sm:mt-0 max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-none shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.5)] sm:shadow-none">
        <div className="card shadow-2xl glass border-t sm:border border-surface-border overflow-hidden rounded-t-3xl sm:rounded-2xl bg-surface/95 sm:bg-surface/80 flex-1 flex flex-col">
          <div className="w-12 h-1.5 bg-surface-border rounded-full mx-auto mt-4 mb-2 sm:hidden shrink-0" />
          {/* Header con tabs */}
          <div className="flex items-center border-b border-surface-border">
            <button
              onClick={() => setTab('followers')}
              className={cn(
                'flex-1 py-4 text-sm font-semibold transition-colors relative',
                tab === 'followers' ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'
              )}
            >
              Seguidores
              <span className="ml-1.5 text-xs text-text-muted">({formatCount(followersCount)})</span>
              {tab === 'followers' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-t" />
              )}
            </button>
            <button
              onClick={() => setTab('following')}
              className={cn(
                'flex-1 py-4 text-sm font-semibold transition-colors relative',
                tab === 'following' ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'
              )}
            >
              Siguiendo
              <span className="ml-1.5 text-xs text-text-muted">({formatCount(followingCount)})</span>
              {tab === 'following' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-t" />
              )}
            </button>
            <button onClick={onClose} className="btn-ghost p-3 mx-2">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lista */}
          <div className="overflow-y-auto max-h-[60vh] custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <div className="py-16 text-center text-text-muted text-sm">
                {tab === 'followers' ? 'Aún no hay seguidores' : 'No sigue a nadie todavía'}
              </div>
            ) : (
              <ul className="divide-y divide-surface-border">
                {users.map(user => {
                  const avatar = user.image ?? getAvatarUrl(user.username)
                  const isFollowing = followStates[user.id] ?? false
                  const isMe = user.id === currentUserId

                  return (
                    <li key={user.id} className="flex items-center gap-3 p-4 hover:bg-surface-2/50 transition-colors">
                      <Link href={`/profile/${user.username}`} onClick={onClose}>
                        <img src={avatar} alt="" className="w-11 h-11 avatar shrink-0" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/profile/${user.username}`}
                          onClick={onClose}
                          className="font-semibold text-sm text-text-primary hover:text-brand-400 transition-colors block truncate"
                        >
                          {user.name ?? user.username}
                        </Link>
                        <p className="text-xs text-text-muted">@{user.username}</p>
                        {user.bio && (
                          <p className="text-xs text-text-secondary mt-0.5 truncate">{user.bio}</p>
                        )}
                      </div>
                      {!isMe && currentUserId && (
                        <button
                          onClick={() => handleFollow(user.id)}
                          className={cn(
                            'shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium transition-all',
                            isFollowing
                              ? 'border-surface-border text-text-muted hover:border-red-500 hover:text-red-400'
                              : 'border-brand-500 text-brand-400 bg-brand-500/10 hover:bg-brand-500/20'
                          )}
                        >
                          {isFollowing
                            ? <><UserCheck className="w-3.5 h-3.5" /> Siguiendo</>
                            : <><UserPlus className="w-3.5 h-3.5" /> Seguir</>
                          }
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
