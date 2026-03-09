import { auth } from '@/lib/auth'
import { getJobs, getSuggestedUsers, getTrendingTags, getTopContributors } from '@/lib/queries'
import { JobCard } from '@/components/jobs/JobCard'
import { Briefcase, Search, Filter } from 'lucide-react'
import { RightSidebar } from '@/components/layout/RightSidebar'
import { JobHeader } from '@/components/jobs/JobHeader'

export default async function JobsPage() {
    const [session, jobs, suggested, trending, topDevs] = await Promise.all([
        auth(),
        getJobs(),
        getSuggestedUsers(),
        getTrendingTags(),
        getTopContributors(),
    ])

    return (
        <div className="flex-1 flex max-w-[1240px] mx-auto">
            <main className="flex-1 px-6 py-8 border-x border-surface-border min-h-screen">
                <JobHeader />
                <div className="flex gap-2 mb-8">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Buscar por cargo, empresa o tecnología..."
                            className="w-full bg-surface-hover border border-surface-border rounded-xl py-2.5 pl-11 pr-4 text-sm outline-none focus:border-brand-500/50 transition-colors"
                        />
                    </div>
                    <button className="px-4 py-2.5 bg-surface-hover border border-surface-border rounded-xl text-text-primary hover:bg-white/5 transition-colors flex items-center gap-2 text-sm font-bold">
                        <Filter className="w-4 h-4" />
                        Filtros
                    </button>
                </div>

                {/* Jobs List */}
                <div className="space-y-4">
                    {jobs.length > 0 ? (
                        jobs.map((job: any) => (
                            <JobCard key={job.id} job={job} />
                        ))
                    ) : (
                        <div className="py-20 text-center">
                            <div className="w-16 h-16 bg-surface-hover rounded-3xl flex items-center justify-center mx-auto mb-4 border border-surface-border">
                                <Briefcase className="w-8 h-8 text-text-muted" />
                            </div>
                            <p className="text-text-primary font-bold">No hay empleos disponibles en este momento</p>
                            <p className="text-text-muted text-sm mt-1">Vuelve pronto para ver nuevas oportunidades.</p>
                        </div>
                    )}
                </div>
            </main>

            <RightSidebar
                suggestedUsers={suggested}
                trendingTags={trending}
                topDevs={topDevs}
            />
        </div>
    )
}
