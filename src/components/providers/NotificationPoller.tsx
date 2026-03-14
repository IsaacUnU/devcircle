'use client'

import { useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useUIStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'

/**
 * Monta una suscripción Realtime al badge de notificaciones.
 * Reemplaza completamente el polling anterior de 10s/15s.
 * Se renderiza null — solo efectos.
 */
export function NotificationPoller() {
  const { data: session } = useSession()
  const { setUnreadCount } = useUIStore()

  const fetchCount = useCallback(async () => {
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

    // Fetch inicial al montar
    fetchCount()

    // Suscripción Realtime — dispara fetchCount en cada cambio
    const channel = supabase
      .channel(`notif-badge:${session.user.id}`)
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `receiverId=eq.${session.user.id}`,
        },
        () => fetchCount()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [session?.user?.id, fetchCount])

  return null
}
