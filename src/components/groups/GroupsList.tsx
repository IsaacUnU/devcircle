'use client'

import { useState, useMemo, useTransition } from 'react'
import Link from 'next/link'
import { Search, Sparkles, Users, Lock } from 'lucide-react'
import { GroupCard } from '@/components/groups/GroupCard'

interface GroupsListProps {
  groups: any[]
}

export function GroupsList({ groups }: GroupsListProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return groups
    return groups.filter(g =>
      g.name.toLowerCase().includes(q) ||
      (g.description ?? '').toLowerCase().includes(q)
    )
  }, [query, groups])

  return (
    <>
      {/* Buscador */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          type="text"
          placeholder="Buscar comunidades (ej: Rust Español, Next.js Experts...)"
          className="w-full bg-surface-hover border border-surface-border rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:border-brand-400/50 transition-all shadow-inner"
        />
        {query && (
          <button onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-lg leading-none">
            ×
          </button>
        )}
      </div>

      {/* Resultados */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <h2 className="font-bold text-text-primary uppercase tracking-widest text-xs">
              {query ? `Resultados para "${query}"` : 'Descubrir'}
            </h2>
          </div>
          {query && (
            <span className="text-xs text-text-muted">{filtered.length} grupo{filtered.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length > 0 ? (
            filtered.map((group: any) => (
              <GroupCard key={group.id} group={group} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
              <Users className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-20" />
              {query
                ? <><p className="text-text-primary font-bold">Sin resultados para "{query}"</p>
                    <p className="text-text-muted text-sm mt-1">Prueba con otro término o crea el grupo tú mismo</p></>
                : <><p className="text-text-primary font-bold italic">El silencio es absoluto...</p>
                    <p className="text-text-muted text-sm mt-1">¡Sé el pionero y crea el primer grupo!</p></>
              }
            </div>
          )}
        </div>
      </section>
    </>
  )
}
