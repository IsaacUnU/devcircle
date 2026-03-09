'use client'

import Link from 'next/link'
import { Heart, MessageCircle, UserPlus, AtSign, Reply, Star } from 'lucide-react'
import { cn, getAvatarUrl, timeAgo } from '@/lib/utils'
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
  }
}

const NOTIF_CONFIG: Record<
  NotificationType,
  { icon: any; color: string; bg: string; text: (username: string) => string; href: (n: Props['notification']) => string }
> = {
  LIKE: {
    icon: Heart,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    text: u => `${u} le ha dado like a tu post`,
    href: n => n.postId ? `/post/${n.postId}` : '/feed',
  },
  COMMENT: {
    icon: MessageCircle,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    text: u => `${u} comentó en tu post`,
    href: n => n.postId ? `/post/${n.postId}` : '/feed',
  },
  FOLLOW: {
    icon: UserPlus,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    text: u => `${u} ha empezado a seguirte`,
    href: n => `/profile/${n.trigger.username}`,
  },
  MENTION: {
    icon: AtSign,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    text: u => `${u} te ha mencionado`,
    href: n => n.postId ? `/post/${n.postId}` : '/feed',
  },
  REPLY: {
    icon: Reply,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    text: u => `${u} respondió a tu comentario`,
    href: n => n.postId ? `/post/${n.postId}` : '/feed',
  },
  REPUTATION: {
    icon: Star,
    color: 'text-brand-400',
    bg: 'bg-brand-500/10',
    text: u => `${u} ha ganado puntos de reputación`,
    href: n => `/profile/${n.trigger.username}`,
  },
}

export function NotificationItem({ notification }: Props) {
  const config = NOTIF_CONFIG[notification.type]
  const Icon = config.icon
  const href = config.href(notification)
  const displayName = notification.trigger.name ?? notification.trigger.username

  return (
    <Link
      href={href}
      className={cn(
        'flex items-start gap-4 px-4 py-4 rounded-xl transition-all hover:bg-surface-hover group',
        !notification.read && 'bg-brand-500/5 border border-brand-500/10'
      )}
    >
      {/* Avatar + Icon badge */}
      <div className="relative shrink-0">
        <img
          src={notification.trigger.image ?? getAvatarUrl(notification.trigger.username)}
          alt=""
          className="w-10 h-10 rounded-full"
        />
        <div className={cn(
          'absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-bg',
          config.bg
        )}>
          <Icon className={cn('w-2.5 h-2.5', config.color)} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary">
          <span className="font-semibold group-hover:text-brand-400 transition-colors">
            @{notification.trigger.username}
          </span>{' '}
          <span className="text-text-secondary">
            {config.text('').replace(notification.trigger.username, '').replace(displayName, '')}
          </span>
        </p>
        <p className="text-xs text-text-muted mt-0.5">{timeAgo(notification.createdAt)}</p>
      </div>

      {/* Unread dot */}
      {!notification.read && (
        <div className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-2" />
      )}
    </Link>
  )
}
