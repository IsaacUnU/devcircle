'use client'

import { useState, useMemo } from 'react'
import { Search, Hash, Bookmark, X, SlidersHorizontal } from 'lucide-react'
import { PostCard } from '@/components/post/PostCard'
import { cn } from '@/lib/utils'

interface BookmarksClientProps {
  posts: any[]
  allTags: string[]
  currentUserId: string
}

export function BookmarksClient({ posts, allTags, currentUserId }: BookmarksClientProps) {
  const [search, setSearch] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    let result = posts

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        p =>
          p.content.toLowerCase().includes(q) ||
          p.author.name?.toLowerCase().includes(q) ||
          p.author.username.toLowerCase().includes(q)
      )
    }

    // Filter by tag
    if (selectedTag) {
      result = result.filter(p =>
        p.tags.some((t: any) => t.tag.name === selectedTag)
      )
    }

    return result
  }, [posts, search, selectedTag])

  if (posts.length === 0) {
    return (
      <div className="card p-12 sm:p-16 text-center animate-scale-in">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
          <Bookmark className="w-8 h-8 text-brand-400/50" />
        </div>
        <p className="text-text-primary font-bold text-lg mb-1">No tienes posts guardados</p>
        <p className="text-sm text-text-muted max-w-xs mx-auto leading-relaxed">
          Guarda posts interesantes para verlos más tarde pulsando el icono <Bookmark className="w-3.5 h-3.5 inline text-brand-400" /> en cualquier publicación
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search + Filter Toggle */}
      <div className="flex gap-2 animate-fade-in">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar en guardados..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-9 !rounded-xl text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {allTags.length > 0 && (
          <button
            onClick={() => setShowFilters(prev => !prev)}
            className={cn(
              'px-3 rounded-xl border transition-all flex items-center gap-1.5 text-sm font-medium shrink-0',
              showFilters
                ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
                : 'bg-surface-card border-surface-border text-text-muted hover:text-text-primary hover:border-surface-hover'
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filtros</span>
          </button>
        )}
      </div>

      {/* Tag Filters */}
      {showFilters && allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 animate-slide-up">
          <button
            onClick={() => setSelectedTag(null)}
            className={cn(
              'tag text-[11px] cursor-pointer transition-all',
              !selectedTag
                ? '!bg-brand-500/20 !border-brand-500/40 !text-brand-300'
                : 'opacity-70 hover:opacity-100'
            )}
          >
            Todos
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={cn(
                'tag text-[11px] cursor-pointer transition-all',
                selectedTag === tag
                  ? '!bg-brand-500/20 !border-brand-500/40 !text-brand-300'
                  : 'opacity-70 hover:opacity-100'
              )}
            >
              <Hash className="w-3 h-3" />
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Results info */}
      {(search || selectedTag) && (
        <p className="text-xs text-text-muted animate-fade-in">
          {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
          {selectedTag && <span> en <span className="text-brand-400">#{selectedTag}</span></span>}
          {search && <span> para &quot;{search}&quot;</span>}
        </p>
      )}

      {/* Posts */}
      {filtered.length > 0 ? (
        <div className="space-y-4 stagger-children">
          {filtered.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      ) : (
        <div className="card p-10 text-center animate-scale-in">
          <Search className="w-8 h-8 text-text-muted/30 mx-auto mb-3" />
          <p className="text-text-secondary font-medium text-sm">Sin resultados</p>
          <p className="text-xs text-text-muted mt-1">
            Prueba con otros términos o quita los filtros
          </p>
        </div>
      )}
    </div>
  )
}
