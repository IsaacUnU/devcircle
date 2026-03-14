'use client'

import Link from 'next/link'
import {
    TrendingUp, Users, ExternalLink, Github,
    BookOpen, Globe, Search, Trophy, Calendar, Zap, Star
} from 'lucide-react'
import { getAvatarUrl, cn } from '@/lib/utils'
import { FollowButton } from '@/components/profile/FollowButton'
import { useSession } from 'next-auth/react'
import { EventsPanel } from '@/components/events/EventsPanel'

interface RightSidebarProps {
    suggestedUsers: any[]
    trendingTags: any[]
    topDevs: any[]
}

const DEV_RESOURCES = [
    { name: 'GitHub', url: 'https://github.com', icon: Github },
    { name: 'MDN Web Docs', url: 'https://developer.mozilla.org', icon: BookOpen },
    { name: 'Can I Use', url: 'https://caniuse.com', icon: Globe },
    { name: 'DevDocs', url: 'https://devdocs.io', icon: Search },
]

// Eventos: gestionados por EventsPanel (DB + scraping externo)

export function RightSidebar({ suggestedUsers, trendingTags, topDevs }: RightSidebarProps) {
    const { data: session } = useSession()

    return (
        <aside className="w-[350px] sticky top-0 h-screen overflow-y-auto px-6 py-8 hidden xl:flex flex-col gap-8 custom-scrollbar">
            {/* 1. Dynamic Rankings */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <Link href={`/leaderboard`}>
                        <h2 className="font-bold text-text-primary text-sm uppercase 
                        tracking-wider cursor-pointer hover:text-brand-400 transition-colors">Top Contribuidores</h2>
                    </Link>
                </div>
                <div className="card p-4 space-y-4">
                    {topDevs.map((user, i) => (
                        <div key={user.id} className="flex items-center gap-3 group relative">
                            <div className="relative shrink-0">
                                <img
                                    src={user.image ?? getAvatarUrl(user.username)}
                                    alt=""
                                    className="w-10 h-10 rounded-full border border-white/10 object-cover"
                                />
                                <div className={cn(
                                    "absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg border-2 border-surface",
                                    i === 0 ? "bg-yellow-500 text-black" :
                                        i === 1 ? "bg-slate-300 text-black" :
                                            i === 2 ? "bg-amber-600 text-white" :
                                                "bg-surface-hover text-text-muted"
                                )}>
                                    {i + 1}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <Link href={`/profile/${user.username}`}>
                                    <p className="text-sm font-bold text-text-primary truncate group-hover:text-brand-400 transition-colors">
                                        {user.name ?? user.username}
                                    </p>
                                </Link>
                                <div className="flex items-center gap-2 text-[10px] text-text-muted font-medium">
                                    <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-brand-400" /> {user._count.posts} posts</span>
                                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {user._count.followers}</span>
                                </div>
                            </div>
                            {i === 0 && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 animate-pulse" />}
                        </div>
                    ))}
                </div>
            </section>

            {/* 2. Trending Tags */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <TrendingUp className="w-5 h-5 text-brand-400" />
                    <h2 className="font-bold text-text-primary text-sm uppercase tracking-wider">Hashtags del Momento</h2>
                </div>
                <div className="card p-3 space-y-0.5 overflow-hidden">
                    {trendingTags.slice(0, 5).map(tag => (
                        <Link
                            key={tag.name}
                            href={`/search?q=%23${encodeURIComponent(tag.name)}`}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-brand-500/10 transition-all group"
                        >
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-text-primary group-hover:text-brand-400">#{tag.name}</span>
                                <span className="text-[10px] text-text-muted">{tag._count.posts} publicaciones</span>
                            </div>
                            <Zap className="w-3.5 h-3.5 text-text-muted group-hover:text-brand-500 transition-colors" />
                        </Link>
                    ))}
                </div>
            </section>

            {/* 3. Eventos próximos — reales por ubicación del perfil */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Calendar className="w-5 h-5 text-brand-400" />
                    <h2 className="font-bold text-text-primary text-sm uppercase tracking-wider">Eventos Próximos</h2>
                </div>
                <EventsPanel />
            </section>

            {/* 4. Suggested Users (Reduced) */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Users className="w-5 h-5 text-brand-400" />
                    <h2 className="font-bold text-text-primary text-sm uppercase tracking-wider">Sugerencias</h2>
                </div>
                <div className="card p-4 space-y-4">
                    {suggestedUsers.slice(0, 3).map(user => (
                        <div key={user.id} className="flex items-center justify-between gap-3 group">
                            <Link href={`/profile/${user.username}`} className="flex items-center gap-3 min-w-0">
                                <img
                                    src={user.image ?? getAvatarUrl(user.username)}
                                    alt=""
                                    className="w-9 h-9 rounded-full border border-white/10 shrink-0"
                                />
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-text-primary truncate transition-colors group-hover:text-brand-400">
                                        {user.name ?? user.username}
                                    </p>
                                    <p className="text-[11px] text-text-muted truncate">@{user.username}</p>
                                </div>
                            </Link>
                            {session?.user?.id && (
                                <FollowButton
                                    targetUserId={user.id}
                                    initialFollowing={false}
                                    className="h-8 px-3 text-xs"
                                    username={user.username}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* 5. Dev Resources */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <ExternalLink className="w-5 h-5 text-brand-400" />
                    <h2 className="font-bold text-text-primary text-sm uppercase tracking-wider">Recursos</h2>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {DEV_RESOURCES.map(res => (
                        <a
                            key={res.name}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-brand-500/30 transition-all group"
                        >
                            <res.icon className="w-3.5 h-3.5 text-text-secondary group-hover:text-brand-400" />
                            <span className="text-[10px] font-bold text-text-secondary group-hover:text-text-primary truncate">{res.name}</span>
                        </a>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 px-4 py-4 text-[10px] text-text-muted border-t border-white/5">
                <span>© {new Date().getFullYear()} Devora</span>
            </div>
        </aside>
    )
}
