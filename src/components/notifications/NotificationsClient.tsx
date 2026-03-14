'use client'

import { useEffect, useState, useCallback } from 'react'
import { Bell, Clock, CheckCheck, UserCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/lib/store'
import { NotificationItem } from './NotificationItem'
import { getAvatarUrl } from '@/lib/utils'
import { respondFollowRequest } from '@/lib/actions/privacy'
import { useRealtimeTable } from '@/hooks/useRealtimeTable'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

type Tab = 'all' | 'requests'

export function NotificationsClient() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading]             = useState(true)
  const [activeTab, setActiveTab]         = useState<Tab>('all')
  const setUnreadCount                    = useUIStore(s => s.setUnreadCount)
  const { data: session }                 = useSession()

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      if (!res.ok) return
      const { notifications: data } = await res.json()
      setNotifications(data)
      const unread = data.filter((n: any) => !n.read).length
      setUnreadCount(unread)
    } catch {}
    finally { setLoading(false) }
  }, [setUnreadCount])

  // Carga inicial
  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  // Realtime: se dispara cuando llega una notificación nueva para este usuario
  useRealtimeTable(
    'notifications',
    session?.user?.id ? { column: 'receiverId', value: session.user.id } : null,
    fetchNotifications
  )

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PATCH' })
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  // Solicitudes pendientes = FOLLOW_REQUEST con followRequestId activo
  const pendingRequests = notifications.filter(
    n => n.type === 'FOLLOW_REQUEST' && n.followRequestId
  )
  // "Todas" incluye TODO — incluyendo FOLLOW_REQUEST ya respondidas
  const allNotifications = notifications
  const unreadCount  = allNotifications.filter(n => !n.read).length
  const pendingCount = pendingRequests.length

  return (
    <>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
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
          {unreadCount > 0 && activeTab === 'all' && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-brand-400 transition-colors border border-white/10 hover:border-brand-500/30 px-3 py-1.5 rounded-xl"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Marcar todo leído
            </button>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-surface-border mb-4">
        <TabButton active={activeTab === 'all'} onClick={() => setActiveTab('all')}
          label="Todas" badge={unreadCount} />
        <TabButton active={activeTab === 'requests'} onClick={() => setActiveTab('requests')}
          label="Solicitudes" badge={pendingCount} badgeColor="bg-orange-500" />
      </div>

      {/* ── Contenido ── */}
      {loading ? (
        <LoadingSkeleton />
      ) : activeTab === 'all' ? (
        <AllNotifications notifications={allNotifications} />
      ) : (
        <RequestsPanel
          requests={pendingRequests}
          onRespond={(id, action) => {
            // tras responder, quitar el followRequestId para que salga del panel
            setNotifications(prev =>
              prev.map(n => n.followRequestId === id ? { ...n, followRequestId: null } : n)
            )
          }}
        />
      )}
    </>
  )
}

// ── Tab button ────────────────────────────────────────────────────────────────
function TabButton({ active, onClick, label, badge, badgeColor = 'bg-brand-500' }: {
  active: boolean; onClick: () => void; label: string
  badge?: number; badgeColor?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors',
        active ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'
      )}
    >
      {label}
      {badge != null && badge > 0 && (
        <span className={cn('text-[10px] text-white font-bold rounded-full px-1.5 py-0.5 leading-none', badgeColor)}>
          {badge}
        </span>
      )}
      {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-t" />}
    </button>
  )
}

// ── Lista de todas las notificaciones ─────────────────────────────────────────
function AllNotifications({ notifications }: { notifications: any[] }) {
  if (notifications.length === 0) {
    return (
      <div className="card p-16 text-center">
        <Bell className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
        <p className="text-text-secondary font-medium">Sin notificaciones aún</p>
        <p className="text-sm text-text-muted mt-1">Cuando alguien interactúe contigo aparecerá aquí</p>
      </div>
    )
  }
  return (
    <div className="space-y-1">
      {notifications.map(n => (
        <NotificationItem key={n.id} notification={n} />
      ))}
    </div>
  )
}

// ── Panel de solicitudes pendientes ──────────────────────────────────────────
function RequestsPanel({
  requests, onRespond,
}: { requests: any[]; onRespond: (id: string, action: 'accept' | 'reject') => void }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const visible = requests.filter(r => !dismissed.has(r.followRequestId))

  async function handleRespond(requestId: string, action: 'accept' | 'reject') {
    setLoadingId(requestId)
    try {
      await respondFollowRequest(requestId, action)
      setDismissed(prev => new Set([...prev, requestId]))
      onRespond(requestId, action)
      toast.success(action === 'accept' ? 'Solicitud aceptada ✓' : 'Solicitud rechazada')
    } catch (err: any) {
      toast.error(err.message ?? 'Error')
    } finally {
      setLoadingId(null)
    }
  }

  if (visible.length === 0) {
    return (
      <div className="card p-16 text-center">
        <UserCheck className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-30" />
        <p className="text-text-secondary font-medium">No hay solicitudes pendientes</p>
        <p className="text-sm text-text-muted mt-1">Cuando alguien solicite seguirte aparecerá aquí</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-text-muted px-1">
        {visible.length} solicitud{visible.length !== 1 ? 'es' : ''} pendiente{visible.length !== 1 ? 's' : ''}
      </p>
      {visible.map(req => {
        const avatar = req.trigger?.image ?? getAvatarUrl(req.trigger?.username ?? '')
        const isLoading = loadingId === req.followRequestId
        return (
          <div key={req.id} className="card p-4 flex items-center gap-3 sm:gap-4 hover:bg-surface-hover/30 transition-colors">
            <a href={`/profile/${req.trigger?.username}`} className="shrink-0">
              <img src={avatar} alt="" className="w-10 h-10 sm:w-12 sm:h-12 avatar" />
            </a>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <a href={`/profile/${req.trigger?.username}`}
                  className="font-semibold text-sm text-text-primary hover:text-brand-400 transition-colors truncate">
                  {req.trigger?.name ?? req.trigger?.username}
                </a>
                <span className="flex items-center gap-1 text-[10px] text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-full px-2 py-0.5 shrink-0">
                  <Clock className="w-2.5 h-2.5" /> Pendiente
                </span>
              </div>
              <p className="text-xs text-text-muted">@{req.trigger?.username} · quiere seguirte</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => handleRespond(req.followRequestId, 'accept')} disabled={isLoading}
                className="text-xs px-3 sm:px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-semibold transition-colors disabled:opacity-50">
                Aceptar
              </button>
              <button onClick={() => handleRespond(req.followRequestId, 'reject')} disabled={isLoading}
                className="text-xs px-3 sm:px-4 py-2 rounded-lg bg-surface-2 border border-surface-border text-text-muted hover:border-red-500/50 hover:text-red-400 transition-colors font-semibold disabled:opacity-50">
                Eliminar
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="card p-4 flex items-center gap-3 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-surface-hover shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-surface-hover rounded w-2/3" />
            <div className="h-2 bg-surface-hover rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
