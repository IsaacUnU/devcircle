'use client'

import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Suscribe a cambios en una tabla de Supabase Realtime.
 * Llama a `onChange` cada vez que haya INSERT/UPDATE/DELETE.
 * Pasa filter=null para deshabilitar la suscripción (ej: usuario no logueado).
 */
export function useRealtimeTable(
  table: string,
  filter: { column: string; value: string } | null,
  onChange: () => void
) {
  const channelRef  = useRef<RealtimeChannel | null>(null)
  // Ref estable para el callback — evita reconexiones por cambio de referencia
  const onChangeRef = useRef(onChange)
  useEffect(() => { onChangeRef.current = onChange }, [onChange])

  useEffect(() => {
    // Sin filtro válido, no suscribir
    if (!filter?.value) return

    const channelName = `rt:${table}:${filter.column}:${filter.value}`

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table,
          filter: `${filter.column}=eq.${filter.value}`,
        },
        () => onChangeRef.current()
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  // Solo reconectar si cambia la tabla o el filtro — no el callback
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, filter?.column, filter?.value])
}
