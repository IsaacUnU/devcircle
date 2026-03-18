'use client'

import { MapPin, Globe, ExternalLink, Calendar as CalendarIcon, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'

interface EventCardProps {
  event: any
}

export function EventCard({ event }: EventCardProps) {
  const isOnline = event.online
  const eventDate = new Date(event.startsAt)

  return (
    <article className="group bg-surface hover:bg-surface-hover border border-surface-border rounded-2xl p-5 transition-all duration-300 relative overflow-hidden flex flex-col h-full">
      {/* Glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <span className="bg-brand-500/10 text-brand-400 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm border border-brand-500/20">
          {event.type}
        </span>
        <div className="flex items-center gap-2">
           <div className="text-right">
             <p className="text-xs text-text-muted font-medium uppercase">{format(eventDate, 'MMM', { locale: es })}</p>
             <p className="text-xl font-black text-text-primary leading-none">{format(eventDate, 'dd')}</p>
           </div>
        </div>
      </div>

      <div className="flex-1 relative z-10">
        <h3 className="text-lg font-bold text-text-primary mb-2 line-clamp-2 group-hover:text-brand-400 transition-colors">
          {event.title}
        </h3>
        {event.description && (
          <p className="text-sm text-text-secondary line-clamp-2 mb-4">
            {event.description}
          </p>
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-surface-border space-y-3 relative z-10">
        <div className="flex flex-col gap-2 text-sm text-text-secondary">
           <div className="flex items-center gap-2">
             <Clock className="w-4 h-4 text-text-muted" />
             <span>{format(eventDate, 'HH:mm', { locale: es })} h</span>
           </div>
           
           <div className="flex items-center gap-2">
             {isOnline ? <Globe className="w-4 h-4 text-brand-400" /> : <MapPin className="w-4 h-4 text-text-muted" />}
             <span className="truncate">{event.location} {isOnline && <span className="text-brand-400 font-medium ml-1">(Online)</span>}</span>
           </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Link href={`/profile/${event.author.username}`} className="flex items-center gap-2 group/author">
             <img src={event.author.image || `https://api.dicebear.com/8.x/initials/svg?seed=${event.author.username}`} alt="" className="w-6 h-6 rounded-full object-cover ring-2 ring-surface border border-surface-border group-hover/author:border-brand-500/50 transition-colors" />
             <span className="text-xs font-medium text-text-secondary group-hover/author:text-text-primary truncate max-w-[100px]">
               {event.author.name || event.author.username}
             </span>
             {event.author.role === 'DEVELOPER' && (
                 <span className="bg-brand-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold ml-1">✓</span>
             )}
          </Link>
          {event.url && (
            <a href={event.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors">
              Ver detalles <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
