import { auth } from '@/lib/auth'
import { getGroups, getSuggestedUsers, getTrendingTags, getTopContributors } from '@/lib/queries'
import { GroupCard } from '@/components/groups/GroupCard'
import { RightSidebar } from '@/components/layout/RightSidebar'
import { GroupHeader } from '@/components/groups/GroupHeader'
import { Search, Sparkles, Users } from 'lucide-react'

export default async function GroupsPage() {
    const [session, groups, suggested, trending, topDevs] = await Promise.all([
        auth(),
        getGroups(),
        getSuggestedUsers(),
        getTrendingTags(),
        getTopContributors(),
    ])

    return (
        <div className="flex-1 flex max-w-[1240px] mx-auto">
            <main className="flex-1 px-6 py-8 border-x border-surface-border min-h-screen">
                <GroupHeader />

                <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Buscar comunidades (ej: Rust Español, Next.js Experts...)"
                        className="w-full bg-surface-hover border border-surface-border rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:border-brand-400/50 transition-all shadow-inner"
                    />
                </div>

                {/* Featured / Explore Section */}
                <section className="mb-12">
                    <div className="flex items-center gap-2 mb-5">
                        <Sparkles className="w-4 h-4 text-brand-400" />
                        <h2 className="font-bold text-text-primary uppercase tracking-widest text-xs">Descubrir</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groups.length > 0 ? (
                            groups.map((group: any) => (
                                <GroupCard key={group.id} group={group} />
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                <Users className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-20" />
                                <p className="text-text-primary font-bold italic">El silencio es absoluto...</p>
                                <p className="text-text-muted text-sm mt-1">¡Sé el pionero y crea el primer grupo de la plataforma!</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <RightSidebar
                suggestedUsers={suggested}
                trendingTags={trending}
                topDevs={topDevs}
            />
        </div>
    )
}
