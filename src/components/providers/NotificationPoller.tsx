'use client'

import { useEffect, useCallback } from 'react'
import { useUIStore } from '@/lib/store'
import { getUnreadNotificationCount } from '@/lib/actions/notifications'
import { useSession } from 'next-auth/react'

export function NotificationPoller() {
    const { data: session } = useSession()
    const { setUnreadCount } = useUIStore()

    const poll = useCallback(async () => {
        if (!session?.user?.id) return
        try {
            const count = await getUnreadNotificationCount()
            setUnreadCount(count)
        } catch (e) {
            // Silently fail polling
        }
    }, [session?.user?.id, setUnreadCount])

    useEffect(() => {
        if (!session?.user?.id) return

        // Initial poll
        poll()

        // Poll every 30 seconds
        const interval = setInterval(poll, 30000)
        return () => clearInterval(interval)
    }, [session?.user?.id, poll])

    return null
}
