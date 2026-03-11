'use client'

import { useEffect, useCallback } from 'react'
import { useUIStore } from '@/lib/store'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'

export function NotificationPoller() {
  const { data: session } = useSession()
  const { setUnreadCount } = useUIStore()
  const pathname = usePathname()

  const poll = useCallback(async () => {
    if (!session?.user?.id) return
    try {
      const res = await fetch('/api/notifications/count')
      if (!res.ok) return
      const { count } = await res.json()
      setUnreadCount(count)
    } catch {}
  }, [session?.user?.id, setUnreadCount])

  useEffect(() => {
    if (!session?.user?.id) return

    poll() // fetch inmediato

    // Cada 10s normalmente, cada 5s si estás EN la página de notificaciones
    const interval = setInterval(poll, pathname === '/notifications' ? 5_000 : 10_000)
    return () => clearInterval(interval)
  }, [session?.user?.id, poll, pathname])

  return null
}
