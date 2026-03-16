'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Search, TrendingUp, Users, Hash, FileText, X, Loader2, Zap, Image as ImageIcon, Calendar } from 'lucide-react'
import { cn, getAvatarUrl } from '@/lib/utils'
import Link from 'next/link'
import { PostCard } from '@/components/post/PostCard'

type SearchTab = 'all' | 'posts' | 'users' | 'multimedia'
type DiscoveryTab = 'foryou' | 'trending' | 'multimedia' | 'events'

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
  relatedTopics: Array<{ name: string; _count: { posts: number } }>
  multimedia: Array<any>
}

import { FollowButton } from '@/components/profile/FollowButton'

interface SearchClientProps {
  trendingTags: TrendingTag[]
  explorePosts: any[]
  exploreMultimedia: any[]
  exploreEvents: any[]
}

export function SearchClient({ trendingTags, explorePosts, exploreMultimedia, exploreEvents }: SearchClientProps) {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '')
  const [tab, setTab] = useState<SearchTab>('all')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  
  // Discovery State
  const [dTab, setDTab] = useState<DiscoveryTab>('foryou')

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
    { id: 'users', label: 'Personas', icon: Users },
    { id: 'multimedia', label: 'Multimedia', icon: ImageIcon },
  ]

  const dTabs: { id: DiscoveryTab; label: string; icon: any }[] = [
    { id: 'foryou', label: 'Para ti', icon: Zap },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'multimedia', label: 'Multimedia', icon: ImageIcon },
    { id: 'events', label: 'Eventos', icon: Calendar },
  ]

  return (
    <main className="flex-1 max-w-2xl px-4 sm:px-6 py-4 sm:py-6 border-x border-surface-border min-h-screen bg-surface">
      {/* Search bar - Refined aesthetic (Frontend Design Skill) */}
      <div className={cn(
        'relative flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-300 backdrop-blur-md',
        focused
          ? 'border-brand-500 bg-surface/80 box-glow shadow-lg shadow-brand-500/10'
          : 'border-surface-border bg-surface-card/50'
      )}>
        {loading
          ? <Loader2 className="w-5 h-5 text-brand-400 animate-spin shrink-0" />
          : <Search className={cn("w-5 h-5 transition-colors", focused ? "text-brand-400" : "text-text-muted")} />
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

      {!query ? (
        /* ── Discovery Hub (Replacement for simple trending list) ── */
        <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-500">
          {/* Discovery Tabs */}
          <div className="flex gap-1 p-1 bg-surface-card/30 rounded-xl border border-surface-border/50 backdrop-blur-sm sticky top-0 z-10 lg:static">
            {dTabs.map(t => (
              <button
                key={t.id}
                onClick={() => setDTab(t.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-xs sm:text-sm font-medium transition-all rounded-lg',
                  dTab === t.id
                    ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20 shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                )}
              >
                <t.icon className={cn("w-4 h-4", dTab === t.id ? "text-brand-400" : "text-text-muted")} />
                <span className="hidden xs:inline">{t.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-8 space-y-6">
            {dTab === 'foryou' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2 px-1">
                  <Zap className="w-5 h-5 text-brand-400 fill-brand-400/20" />
                  <h2 className="font-bold text-lg text-text-primary tracking-tight">Especialmente para ti</h2>
                </div>
                {explorePosts.map((post) => (
                  <PostCard key={post.id} post={post} currentUserId={session?.user?.id} />
                ))}
              </div>
            )}

            {dTab === 'trending' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4 px-1">
                  <TrendingUp className="w-5 h-5 text-brand-400" />
                  <h2 className="font-bold text-lg text-text-primary">Temas del momento</h2>
                </div>
                {trendingTags.length === 0 ? (
                  <div className="text-center py-20 text-text-muted border-2 border-dashed border-surface-border rounded-3xl">
                    <Hash className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No hay tendencias aún.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {trendingTags.map((tag, i) => (
                      <button
                        key={tag.name}
                        onClick={() => setQuery(`#${tag.name}`)}
                        className="group flex items-center justify-between p-4 rounded-2xl bg-surface-card/40 border border-surface-border/50 hover:border-brand-500/30 hover:bg-surface-hover transition-all text-left"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-xl font-black text-text-muted/20 group-hover:text-brand-500/20 transition-colors">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <div>
                            <p className="font-bold text-text-primary group-hover:text-brand-400 transition-colors">#{tag.name}</p>
                            <p className="text-xs text-text-muted mt-0.5">{tag._count.posts} posts esta semana</p>
                          </div>
                        </div>
                        <TrendingUp className="w-4 h-4 text-text-muted group-hover:text-brand-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {dTab === 'multimedia' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2 px-1">
                  <ImageIcon className="w-5 h-5 text-brand-400" />
                  <h2 className="font-bold text-lg text-text-primary">Multimedia reciente</h2>
                </div>
                {exploreMultimedia.length === 0 ? (
                  <div className="text-center py-20 text-text-muted border-2 border-dashed border-surface-border rounded-3xl">
                    <p>No hay contenido multimedia reciente.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {exploreMultimedia.map((post) => (
                      <PostCard key={post.id} post={post} currentUserId={session?.user?.id} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {dTab === 'events' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4 px-1">
                  <Calendar className="w-5 h-5 text-brand-400" />
                  <h2 className="font-bold text-lg text-text-primary">Próximos Eventos</h2>
                </div>
                {exploreEvents.length === 0 ? (
                  <div className="text-center py-16 text-text-muted bg-surface-card/20 rounded-3xl border border-surface-border/50">
                    <p>No hay eventos próximos programados.</p>
                  </div>
                ) : (
                  exploreEvents.map(e => (
                    <div key={e.id} className="card p-5 group hover:border-brand-500/30 transition-all bg-surface-card/40 backdrop-blur-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Calendar className="w-16 h-16 text-brand-400" />
                      </div>
                      <p className="text-xs text-brand-400 font-bold uppercase tracking-widest mb-2">
                        {new Date(e.startsAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                      </p>
                      <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-brand-400 transition-colors leading-tight">
                        {e.title}
                      </h3>
                      <p className="text-sm text-text-secondary line-clamp-2 mb-4 leading-relaxed">
                        {e.description}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-3">
                           <img src={e.author.image ?? getAvatarUrl(e.author.username)} className="w-6 h-6 rounded-full" alt="" />
                           <span className="text-xs text-text-muted">@{e.author.username}</span>
                        </div>
                        <button className="text-xs font-bold text-brand-400 underline-offset-4 hover:underline">Ver detalles</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── Search Results ── */
        <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Unified Search Tabs (Matches Discovery Hub style) */}
          <div className="flex gap-1 p-1 bg-surface-card/30 rounded-xl border border-surface-border/50 backdrop-blur-sm sticky top-0 z-10 lg:static">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-xs sm:text-sm font-medium transition-all rounded-lg',
                  tab === t.id
                    ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20 shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                )}
              >
                <t.icon className={cn("w-4 h-4", tab === t.id ? "text-brand-400" : "text-text-muted")} />
                <span className="hidden xs:inline">{t.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-8">
            {loading && !results ? (
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
              <div className="space-y-12 pb-20">
                {/* Related Topics Bar (X-Style Context) */}
                {results.relatedTopics.length > 0 && (
                  <section className="bg-brand-500/5 -mx-4 sm:-mx-6 px-4 sm:px-6 py-6 border-y border-brand-500/10 mb-8">
                    <div className="flex items-center gap-2 mb-4 px-1">
                      <Hash className="w-4 h-4 text-brand-400" />
                      <h3 className="text-[10px] font-black text-brand-400 uppercase tracking-[0.2em]">Temas relacionados</h3>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
                      {results.relatedTopics.map(tag => (
                        <button
                          key={tag.name}
                          onClick={() => setQuery(`#${tag.name}`)}
                          className="shrink-0 flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-surface border border-surface-border/50 hover:border-brand-500/50 hover:bg-brand-500/5 transition-all shadow-sm group"
                        >
                          <Hash className="w-3.5 h-3.5 text-brand-400" />
                          <span className="text-sm font-bold text-text-primary group-hover:text-brand-400 transition-colors">#{tag.name}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* ── Top Matches (Prioritized Users) ── */}
                {(tab === 'all' || tab === 'users') && results.users.length > 0 && (
                  <section className="animate-in fade-in slide-in-from-left-4 duration-500">
                    {tab === 'all' && (
                       <div className="flex items-center gap-2 mb-5 px-1">
                          <Users className="w-4 h-4 text-brand-400" />
                          <h3 className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em]">Personas</h3>
                       </div>
                    )}
                    <div className="grid grid-cols-1 gap-4">
                      {results.users.map((user, i) => (
                        <div 
                          key={user.id}
                          style={{ animationDelay: `${i * 50}ms` }}
                          className="group p-5 flex items-center gap-5 rounded-[2rem] bg-surface-card/40 border border-surface-border/50 hover:border-brand-500/40 hover:bg-surface-hover/80 transition-all relative overflow-hidden backdrop-blur-sm shadow-sm animate-in fade-in slide-in-from-right-4">
                          <Link href={`/profile/${user.username}`} className="shrink-0">
                            <img 
                              src={user.image ?? getAvatarUrl(user.username)} 
                              alt="" 
                              className="w-14 h-14 avatar object-cover shadow-xl border-2 border-brand-500/20 group-hover:border-brand-500/50 transition-colors" 
                            />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link href={`/profile/${user.username}`} className="block w-fit">
                               <p className="font-black text-text-primary group-hover:text-brand-400 transition-colors text-lg">{user.name ?? user.username}</p>
                            </Link>
                            <p className="text-sm text-text-muted">@{user.username}</p>
                            {user.bio && <p className="text-sm text-text-secondary mt-2 line-clamp-1 italic font-medium leading-relaxed opacity-80 group-hover:opacity-100">{user.bio}</p>}
                          </div>
                          <div className="flex flex-col items-end gap-3 shrink-0">
                             {session?.user?.id && user.id !== session.user.id && (
                               <FollowButton 
                                 targetUserId={user.id}
                                 username={user.username}
                                 initialFollowing={user.isFollowing}
                                 className="py-1.5 px-4 rounded-xl text-xs h-9"
                               />
                             )}
                             <div className="text-right">
                               <p className="text-sm font-black text-text-primary tabular-nums">{user._count.followers}</p>
                               <p className="text-[9px] text-text-muted font-black uppercase tracking-tighter">seguidores</p>
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Multimedia Section */}
                {(tab === 'all' || tab === 'multimedia') && results.multimedia.length > 0 && (
                  <section>
                    {tab === 'all' && (
                       <div className="flex items-center gap-2 mb-6 px-1">
                          <ImageIcon className="w-4 h-4 text-brand-400" />
                          <h3 className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em]">Multimedia</h3>
                       </div>
                    )}
                    <div className="masonry-grid gap-4">
                      {results.multimedia.map((post: any) => (
                        <div key={post.id} className="break-inside-avoid mb-4">
                           <PostCard post={post} currentUserId={session?.user?.id} />
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Posts Section */}
                {(tab === 'all' || tab === 'posts') && results.posts.length > 0 && (
                  <section>
                    {tab === 'all' && (
                       <div className="flex items-center gap-2 mb-6 px-1">
                          <FileText className="w-4 h-4 text-brand-400" />
                          <h3 className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em]">Publicaciones</h3>
                       </div>
                    )}
                    <div className="space-y-6">
                      {results.posts.map((post: any) => (
                        <PostCard key={post.id} post={post} currentUserId={session?.user?.id} />
                      ))}
                    </div>
                  </section>
                )}

                {results.users.length === 0 && results.posts.length === 0 && results.multimedia.length === 0 && (
                  <div className="text-center py-20 bg-surface-card/10 rounded-3xl border border-dashed border-surface-border/50">
                    <Search className="w-12 h-12 text-text-muted/20 mx-auto mb-4" />
                    <p className="text-text-primary font-bold">Sin resultados para &quot;{query}&quot;</p>
                    <p className="text-sm text-text-muted mt-2">Prueba con otros términos o busca por #tag</p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </main>
  )
}
