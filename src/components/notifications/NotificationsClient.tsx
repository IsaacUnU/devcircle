'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Bell, Heart, MessageCircle, UserPlus, AtSign, CheckCheck, Zap, RefreshCw, MessageSquare } from 'lucide-react'
import { getAvatarUrl, timeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/lib/store'

const NOTIF_ICONS: Record<string, { icon: any; color: string; bg: string }> = {
  LIKE:       { icon: Heart,         color: 'text-red-400',    bg: 'bg-red-500/10' },
  COMMENT:    { icon: MessageCircle, color: 'text-brand-400',  bg: 'bg-brand-500/10' },
  FOLLOW:     { icon: UserPlus,      color: 'text-purple-400', bg: 'bg-purple-500/10' },
  MENTION:    { icon: AtSign,        color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  REPLY:      { icon: MessageSquare, color: 'text-blue-400',   bg: 'bg-blue-500/10' },
  REPUTATION: { icon: Zap,           color: 'text-brand-400',  bg: 'bg-brand-500/10' },
}

const NOTIF_LABELS: Record<string, string> = {
  LIKE:       'dio like a tu post',
  COMMENT:    'comentó tu post',
  FOLLOW:     'empezó a seguirte',
  MENTION:    'te mencionó',
  REPLY:      'respondió a tu comentario',
  REPUTATION: 'ganaste puntos de reputación',
}

export function NotificationsClient() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading]             = useState(true)
  const [lastFetch, setLastFetch]         = useState<Date | null>(null)
  const setUnreadCount                    = useUIStore(s => s.setUnreadCount)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      if (!res.ok) return
      const { notifications: data } = await res.json()
      setNotifications(data)
      setLastFetch(new Date())
      const unread = data.filter((n: any) => !n.read).length
      setUnreadCount(unread)
    } catch {}
    finally { setLoading(false) }
  }, [setUnreadCount])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 10_000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PATCH' })
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-brand-400" />
          <h1 className="text-xl font-bold text-text-primary">Notificaciones</h1>
          {unreadCount > 0 && (
            <span className="text-xs bg-brand-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {lastFetch && (
            <span className="flex items-center gap-1 text-[11px] text-text-muted">
              <RefreshCw className="w-3 h-3" />
              Auto · cada 10s
            </span>
          )}
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-brand-400 transition-colors border border-white/10 hover:border-brand-500/30 px-3 py-1.5 rounded-xl">
              <CheckCheck className="w-3.5 h-3.5" /> Marcar todo leído
            </button>
          )}
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-4 flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-surface-hover" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-surface-hover rounded w-2/3" />
                <div className="h-2 bg-surface-hover rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="card p-16 text-center">
          <Bell className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
          <p className="text-text-secondary font-medium">Sin notificaciones aún</p>
          <p className="text-sm text-text-muted mt-1">Cuando alguien interactúe con tus posts aparecerá aquí</p>
        </div>
      ) : (
        <div className="space-y-1">
          {notifications.map(n => {
            const cfg = NOTIF_ICONS[n.type] ?? NOTIF_ICONS.LIKE
            const Icon = cfg.icon
            return (
              <div key={n.id} className={cn(
                'flex items-center gap-3 p-4 rounded-2xl border transition-all',
                n.read
                  ? 'border-transparent hover:bg-white/[0.02]'
                  : 'border-brand-500/20 bg-brand-500/5 hover:bg-brand-500/8'
              )}>
                <div className="relative shrink-0">
                  <img
                    src={n.trigger?.image ?? getAvatarUrl(n.trigger?.username ?? '')}
                    alt="" className="w-10 h-10 rounded-full border border-white/10 object-cover"
                  />
                  <div className={cn('absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-surface', cfg.bg)}>
                    <Icon className={cn('w-2.5 h-2.5', cfg.color)} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary">
                    <Link href={`/profile/${n.trigger?.username}`} className="font-bold hover:text-brand-400 transition-colors">
                      {n.trigger?.name ?? n.trigger?.username}
                    </Link>
                    {' '}<span className="text-text-secondary">{NOTIF_LABELS[n.type] ?? ''}</span>
                  </p>
                  <p className="text-[11px] text-text-muted mt-0.5">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
