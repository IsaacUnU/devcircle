'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Heart, MessageCircle, UserPlus, UserCheck, AtSign, Reply, Star, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { cn, getAvatarUrl, timeAgo } from '@/lib/utils'
import { respondFollowRequest } from '@/lib/actions/privacy'
import toast from 'react-hot-toast'
import type { NotificationType } from '@prisma/client'

interface Props {
  notification: {
    id: string
    type: NotificationType
    read: boolean
    createdAt: Date
    postId: string | null
    commentId: string | null
    trigger: {
      id: string
      username: string
      name: string | null
      image: string | null
    }
    // Solo para FOLLOW_REQUEST — id de la solicitud en la tabla follow_requests
    followRequestId?: string | null
  }
}

const NOTIF_CONFIG: Record<
  string,
  { icon: any; color: string; bg: string; text: string; href: (n: Props['notification']) => string }
> = {
  LIKE: {
    icon: Heart, color: 'text-red-400', bg: 'bg-red-500/10',
    text: 'le ha dado like a tu post',
    href: n => n.postId ? `/post/${n.postId}` : '/feed',
  },
  COMMENT: {
    icon: MessageCircle, color: 'text-blue-400', bg: 'bg-blue-500/10',
    text: 'comentó en tu post',
    href: n => n.postId ? `/post/${n.postId}` : '/feed',
  },
  FOLLOW: {
    icon: UserPlus, color: 'text-green-400', bg: 'bg-green-500/10',
    text: 'ha empezado a seguirte',
    href: n => `/profile/${n.trigger.username}`,
  },
  FOLLOW_REQUEST: {
    icon: Clock, color: 'text-brand-400', bg: 'bg-brand-500/10',
    text: 'quiere seguirte',
    href: n => `/settings?tab=privacy`,
  },
  FOLLOW_ACCEPTED: {
    icon: UserCheck, color: 'text-green-400', bg: 'bg-green-500/10',
    text: 'aceptó tu solicitud de seguimiento',
    href: n => `/profile/${n.trigger.username}`,
  },
  MENTION: {
    icon: AtSign, color: 'text-purple-400', bg: 'bg-purple-500/10',
    text: 'te ha mencionado',
    href: n => n.postId ? `/post/${n.postId}` : '/feed',
  },
  REPLY: {
    icon: Reply, color: 'text-yellow-400', bg: 'bg-yellow-500/10',
    text: 'respondió a tu comentario',
    href: n => n.postId ? `/post/${n.postId}` : '/feed',
  },
  REPUTATION: {
    icon: Star, color: 'text-brand-400', bg: 'bg-brand-500/10',
    text: 'has ganado puntos de reputación',
    href: n => `/profile/${n.trigger.username}`,
  },
}

export function NotificationItem({ notification }: Props) {
  const config = NOTIF_CONFIG[notification.type] ?? NOTIF_CONFIG.FOLLOW
  const Icon = config.icon
  const href = config.href(notification)
  const isFollowRequest = notification.type === 'FOLLOW_REQUEST'

  const [status, setStatus] = useState<'pending' | 'accepted' | 'rejected' | null>(
    isFollowRequest ? 'pending' : null
  )
  const [loading, setLoading] = useState(false)

  async function handleRespond(action: 'accept' | 'reject') {
    if (!notification.followRequestId) return
    setLoading(true)
    try {
      await respondFollowRequest(notification.followRequestId, action)
      setStatus(action === 'accept' ? 'accepted' : 'rejected')
      toast.success(action === 'accept' ? 'Solicitud aceptada' : 'Solicitud rechazada')
    } catch (err: any) {
      toast.error(err.message ?? 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn(
      'flex items-start gap-4 px-4 py-4 rounded-xl transition-all group',
      !notification.read && 'bg-brand-500/5 border border-brand-500/10',
      !isFollowRequest && 'hover:bg-surface-hover cursor-pointer'
    )}>
      {/* Avatar + icono */}
      <Link href={`/profile/${notification.trigger.username}`} className="relative shrink-0">
        <img
          src={notification.trigger.image ?? getAvatarUrl(notification.trigger.username)}
          alt=""
          className="w-10 h-10 avatar object-cover shadow-sm"
        />
        <div className={cn(
          'absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-bg',
          config.bg
        )}>
          <Icon className={cn('w-2.5 h-2.5', config.color)} />
        </div>
      </Link>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        {/* Texto */}
        {isFollowRequest ? (
          <p className="text-sm text-text-primary">
            <Link href={`/profile/${notification.trigger.username}`}
              className="font-semibold hover:text-brand-400 transition-colors">
              @{notification.trigger.username}
            </Link>
            {' '}<span className="text-text-secondary">{config.text}</span>
          </p>
        ) : (
          <Link href={href} className="block">
            <p className="text-sm text-text-primary group-hover:text-brand-400/80 transition-colors">
              <span className="font-semibold">@{notification.trigger.username}</span>
              {' '}<span className="text-text-secondary">{config.text}</span>
            </p>
          </Link>
        )}

        <p className="text-xs text-text-muted mt-0.5">{timeAgo(notification.createdAt)}</p>

        {/* Botones de aceptar/rechazar — solo para FOLLOW_REQUEST */}
        {isFollowRequest && status === 'pending' && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => handleRespond('accept')}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-brand-500/10 border border-brand-500/30 text-brand-400 hover:bg-brand-500/20 transition-colors font-medium disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Aceptar
            </button>
            <button
              onClick={() => handleRespond('reject')}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-surface-2 border border-surface-border text-text-muted hover:border-red-500/50 hover:text-red-400 transition-colors font-medium disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              Rechazar
            </button>
          </div>
        )}

        {/* Feedback tras responder */}
        {isFollowRequest && status === 'accepted' && (
          <p className="flex items-center gap-1.5 mt-2 text-xs text-green-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Solicitud aceptada
          </p>
        )}
        {isFollowRequest && status === 'rejected' && (
          <p className="flex items-center gap-1.5 mt-2 text-xs text-text-muted font-medium">
            <XCircle className="w-3.5 h-3.5" /> Solicitud rechazada
          </p>
        )}
      </div>

      {/* Punto no leído */}
      {!notification.read && (
        <div className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-2" />
      )}
    </div>
  )
}
