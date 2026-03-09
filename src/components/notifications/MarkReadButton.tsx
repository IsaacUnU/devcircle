'use client'

import { useTransition } from 'react'
import { CheckCheck } from 'lucide-react'
import { markAllNotificationsRead } from '@/lib/actions/notifications'
import { useUIStore } from '@/lib/store'
import toast from 'react-hot-toast'

export function MarkReadButton() {
  const [isPending, startTransition] = useTransition()
  const { setUnreadCount } = useUIStore()

  const handleClick = () => {
    startTransition(async () => {
      await markAllNotificationsRead()
      setUnreadCount(0)
      toast.success('Notificaciones marcadas como leídas')
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="flex items-center gap-2 text-sm text-text-muted hover:text-brand-400 transition-colors disabled:opacity-50"
    >
      <CheckCheck className="w-4 h-4" />
      {isPending ? 'Marcando...' : 'Marcar todas como leídas'}
    </button>
  )
}
