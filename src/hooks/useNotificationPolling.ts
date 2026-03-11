'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useUIStore } from '@/lib/store'

// Hook global de polling — se monta una sola vez en el layout
// Actualiza el badge de notificaciones cada 15 segundos
export function useNotificationPolling() {
  const { data: session } = useSession()
  const setUnreadCount = useUIStore(s => s.setUnreadCount)

  useEffect(() => {
    if (!session?.user?.id) return

    // Fetch inmediato al montar
    const fetchCount = async () => {
      try {
        const res = await fetch('/api/notifications/count')
        if (!res.ok) return
        const { count } = await res.json()
        setUnreadCount(count)
      } catch {}
    }

    fetchCount()
    const interval = setInterval(fetchCount, 15_000) // cada 15 segundos
    return () => clearInterval(interval)
  }, [session?.user?.id, setUnreadCount])
}
