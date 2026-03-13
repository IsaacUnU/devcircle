'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Search, TrendingUp, Users, Hash, FileText, X, Loader2 } from 'lucide-react'
import { cn, getAvatarUrl } from '@/lib/utils'
import Link from 'next/link'
import { PostCard } from '@/components/post/PostCard'

type SearchTab = 'all' | 'posts' | 'users' | 'tags'

interface TrendingTag {
  name: string
  _count: { posts: number }
}

interface SearchResult {
  users: Array<{
    id: string
    username: string
    name: string | null
    image: string | null
    bio: string | null
    _count: { followers: number; posts: number }
    isFollowing: boolean
  }>
  posts: Array<any>
  tags: Array<{ name: string; _count: { posts: number } }>
}

interface SearchClientProps {
  trendingTags: TrendingTag[]
}

export function SearchClient({ trendingTags }: SearchClientProps) {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '')
  const [tab, setTab] = useState<SearchTab>('all')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults(null); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&tab=${tab}`)
      const data = await res.json()
      setResults(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(query), 350)
    return () => clearTimeout(debounceRef.current)
  }, [query, tab, doSearch])

  const tabs: { id: SearchTab; label: string; icon: any }[] = [
    { id: 'all', label: 'Todo', icon: Search },
    { id: 'posts', label: 'Posts', icon: FileText },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'tags', label: 'Tags', icon: Hash },
  ]

  return (
    <main className="flex-1 max-w-2xl px-4 sm:px-6 py-4 sm:py-6 border-x border-surface-border min-h-screen">
      {/* Search bar */}
      <div className={cn(
        'relative flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-200',
        focused
          ? 'border-brand-500 bg-surface shadow-lg shadow-brand-500/10'
          : 'border-surface-border bg-surface-hover'
      )}>
        {loading
          ? <Loader2 className="w-5 h-5 text-brand-400 animate-spin shrink-0" />
          : <Search className="w-5 h-5 text-text-muted shrink-0" />
        }
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar devs, posts, #tags..."
          value={query}
          onChange={e => { setQuery(e.target.value); setTab('all') }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent text-text-primary placeholder:text-text-muted outline-none text-sm"
          autoComplete="off"
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-text-muted hover:text-text-primary transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tabs */}
      {query && (
        <div className="flex gap-1 mt-4 border-b border-surface-border">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px',
                tab === t.id
                  ? 'border-brand-500 text-brand-400'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              )}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6">
        {!query ? (
          /* ── Trending real desde DB ── */
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-brand-400" />
              <h2 className="font-semibold text-text-primary">Trending en DevCircle</h2>
            </div>

            {trendingTags.length === 0 ? (
              <div className="text-center py-16 text-text-muted">
                <Hash className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Todavía no hay tags. ¡Sé el primero en publicar!</p>
              </div>
            ) : (
              <div className="space-y-1">
                {trendingTags.map((tag, i) => (
                  <button
                    key={tag.name}
                    onClick={() => setQuery(`#${tag.name}`)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-surface-hover transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-text-muted w-4">{i + 1}</span>
                      <div className="text-left">
                        <p className="text-sm font-medium text-text-primary group-hover:text-brand-400 transition-colors">
                          #{tag.name}
                        </p>
                        <p className="text-xs text-text-muted">
                          {tag._count.posts} {tag._count.posts === 1 ? 'publicación' : 'publicaciones'}
                        </p>
                      </div>
                    </div>
                    <Hash className="w-4 h-4 text-text-muted group-hover:text-brand-400 transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : loading && !results ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-hover" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-surface-hover rounded w-1/3" />
                    <div className="h-3 bg-surface-hover rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : results ? (
          <div className="space-y-6">
            {/* Users */}
            {(tab === 'all' || tab === 'users') && results.users.length > 0 && (
              <section>
                {tab === 'all' && <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Usuarios</h3>}
                <div className="space-y-2">
                  {results.users.map(user => (
                    <Link key={user.id} href={`/profile/${user.username}`}
                      className="card p-4 flex items-center gap-3 hover:border-brand-500/30 transition-all group">
                      <img src={user.image ?? getAvatarUrl(user.username)} alt="" className="w-11 h-11 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text-primary group-hover:text-brand-400 transition-colors">{user.name ?? user.username}</p>
                        <p className="text-sm text-text-muted">@{user.username}</p>
                        {user.bio && <p className="text-sm text-text-secondary mt-1 truncate">{user.bio}</p>}
                      </div>
                      <div className="text-right text-xs text-text-muted">
                        <p className="font-medium text-text-secondary">{user._count.followers}</p>
                        <p>seguidores</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
            {/* Tags */}
            {(tab === 'all' || tab === 'tags') && results.tags.length > 0 && (
              <section>
                {tab === 'all' && <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Tags</h3>}
                <div className="flex flex-wrap gap-2">
                  {results.tags.map(tag => (
                    <button key={tag.name} onClick={() => setQuery(`#${tag.name}`)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-hover border border-surface-border hover:border-brand-500/50 hover:bg-brand-500/5 transition-all group">
                      <Hash className="w-3.5 h-3.5 text-brand-400" />
                      <span className="text-sm font-medium text-text-primary">{tag.name}</span>
                      <span className="text-xs text-text-muted">{tag._count.posts}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}
            {/* Posts */}
            {(tab === 'all' || tab === 'posts') && results.posts.length > 0 && (
              <section>
                {tab === 'all' && <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Posts</h3>}
                <div className="space-y-4">
                  {results.posts.map((post: any) => (
                    <PostCard key={post.id} post={post} currentUserId={session?.user?.id} />
                  ))}
                </div>
              </section>
            )}
            {results.users.length === 0 && results.posts.length === 0 && results.tags.length === 0 && (
              <div className="text-center py-16">
                <Search className="w-12 h-12 text-text-muted mx-auto mb-3" />
                <p className="text-text-secondary font-medium">Sin resultados para &quot;{query}&quot;</p>
                <p className="text-sm text-text-muted mt-1">Prueba con otros términos o busca por #tag</p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </main>
  )
}
