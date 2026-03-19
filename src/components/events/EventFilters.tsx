'use client'

import { Search, Filter } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'HACKATHON', label: 'Hackathons' },
  { id: 'CONFERENCIA', label: 'Conferencias' },
  { id: 'MEETUP', label: 'Meetups' },
  { id: 'WORKSHOP', label: 'Workshops' },
  { id: 'WEBINAR', label: 'Webinars' },
]

export function EventFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentType = searchParams.get('type') || 'all'
  const currentSearch = searchParams.get('search') || ''

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value)
      else params.delete(key)
    })
    
    startTransition(() => {
      router.push(`/events?${params.toString()}`)
    })
  }

  return (
    <div className={cn("mb-8 space-y-6 transition-opacity", isPending && "opacity-60")}>
      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-brand-500 transition-colors" />
        <input
          type="text"
          defaultValue={currentSearch}
          placeholder="Buscar por título, descripción o ubicación..."
          className="w-full bg-surface-hover border border-surface-border rounded-2xl py-3.5 pl-12 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              updateFilters({ search: e.currentTarget.value })
            }
          }}
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-wider mr-2">
          <Filter className="w-3.5 h-3.5" />
          Filtrar
        </div>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => updateFilters({ type: cat.id })}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-all",
              currentType === cat.id
                ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20"
                : "bg-surface-hover text-text-secondary hover:bg-surface-border hover:text-text-primary"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  )
}
