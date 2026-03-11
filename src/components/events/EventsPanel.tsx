'use client'

import { useEffect, useState } from 'react'
import { Calendar, MapPin, Globe, ExternalLink, Loader2, BadgeCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EventItem {
  id: string
  title: string
  description: string | null
  url: string | null
  location: string
  type: string
  startsAt: string
  online: boolean
  author: { username: string; name: string | null }
}

const TYPE_STYLES: Record<string, { label: string; color: string }> = {
  HACKATHON:   { label: 'Hackathon',   color: 'text-brand-400 bg-brand-500/10' },
  CONFERENCIA: { label: 'Conferencia', color: 'text-blue-400 bg-blue-500/10' },
  MEETUP:      { label: 'Meetup',      color: 'text-orange-400 bg-orange-500/10' },
  WORKSHOP:    { label: 'Workshop',    color: 'text-purple-400 bg-purple-500/10' },
  WEBINAR:     { label: 'Webinar',     color: 'text-cyan-400 bg-cyan-500/10' },
  OTRO:        { label: 'Evento',      color: 'text-text-muted bg-surface-hover' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export function EventsPanel() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/events')
      .then(r => r.json())
      .then(data => setEvents(data.events ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="card p-4 flex items-center justify-center gap-2 text-text-muted">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-xs">Cargando eventos...</span>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="card p-4 text-center text-xs text-text-muted space-y-1">
        <Calendar className="w-6 h-6 mx-auto mb-2 opacity-30" />
        <p>No hay eventos próximos cerca de ti.</p>
        <p className="opacity-60 flex items-center justify-center gap-1">
          <BadgeCheck className="w-3 h-3" /> Usuarios verificados pueden crear eventos
        </p>
      </div>
    )
  }

  return (
    <div className="card divide-y divide-white/5 overflow-hidden">
      {events.map(event => {
        const style = TYPE_STYLES[event.type] ?? TYPE_STYLES.OTRO
        const Wrapper = event.url ? 'a' : 'div'
        const extraProps = event.url
          ? { href: event.url, target: '_blank', rel: 'noopener noreferrer' }
          : {}
        return (
          <Wrapper
            key={event.id}
            {...(extraProps as any)}
            className="block p-3.5 hover:bg-white/5 transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5 gap-2">
              <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md', style.color)}>
                {style.label}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-bold text-text-muted">{formatDate(event.startsAt)}</span>
                {event.url && (
                  <ExternalLink className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            </div>
            <p className="text-sm font-bold text-text-primary leading-tight group-hover:text-brand-400 transition-colors line-clamp-2">
              {event.title}
            </p>
            <div className="flex items-center gap-1 mt-1.5 text-[11px] text-text-muted">
              {event.online
                ? <><Globe className="w-3 h-3" /><span>Online</span></>
                : <><MapPin className="w-3 h-3" /><span>{event.location}</span></>
              }
              <span className="ml-auto opacity-50">@{event.author.username}</span>
            </div>
          </Wrapper>
        )
      })}
    </div>
  )
}
