import { auth } from '@/lib/auth'
import { getProjects, getSuggestedUsers, getTrendingTags, getTopContributors } from '@/lib/queries'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { RightSidebar } from '@/components/layout/RightSidebar'
import { ProjectHeader } from '@/components/projects/ProjectHeader'
import { Sparkles, Code2 } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Proyectos',
    description: 'Descubre y comparte proyectos increíbles creados por la comunidad de DevCircle.',
}

export default async function ProjectsPage() {
    const [session, projects, suggested, trending, topDevs] = await Promise.all([
        auth(),
        getProjects(),
        getSuggestedUsers(),
        getTrendingTags(),
        getTopContributors(),
    ])

    return (
        <div className="flex-1 flex max-w-[1240px] mx-auto">
            <main className="flex-1 px-4 sm:px-6 py-4 sm:py-8 border-x border-surface-border min-h-screen">
                <ProjectHeader />

                {/* Featured Section placeholder */}
                <section className="mb-8 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-brand-600/20 to-surface border border-brand-500/20 relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-widest mb-3">
                                <Sparkles className="w-4 h-4" />
                                Destacado de la semana
                            </div>
                            <h2 className="text-xl sm:text-3xl font-black text-white mb-3 sm:mb-4 leading-tight">DevCircle v2: La Red Social para Developers</h2>
                            <p className="text-text-secondary mb-6 leading-relaxed">
                                Explora el código fuente detrás de esta increíble plataforma. Construida con Next.js 14, Prisma, PostgreSQL y un diseño UI/UX de otro nivel.
                            </p>
                            <div className="flex gap-3">
                                <button className="px-6 py-2.5 bg-brand-500 text-white rounded-xl font-bold text-sm hover:brightness-110 transition-all">Ver Más</button>
                                <button className="px-6 py-2.5 bg-white/5 text-white rounded-xl font-bold text-sm hover:bg-white/10 border border-white/5 transition-all">Visitar Repo</button>
                            </div>
                        </div>
                        <div className="w-full md:w-64 aspect-video rounded-2xl bg-black/40 border border-white/5 backdrop-blur-xl flex items-center justify-center">
                            <Code2 className="w-16 h-16 text-brand-500/20" />
                        </div>
                    </div>
                    {/* Decoration */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-500/20 rounded-full blur-[80px]" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-[80px]" />
                </section>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {projects.length > 0 ? (
                        projects.map((project: any) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                currentUserId={session?.user?.id}
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <div className="w-16 h-16 bg-surface-hover rounded-3xl flex items-center justify-center mx-auto mb-4 border border-surface-border">
                                <Code2 className="w-8 h-8 text-text-muted" />
                            </div>
                            <p className="text-text-primary font-bold">Aún no hay proyectos publicados</p>
                            <p className="text-text-muted text-sm mt-1">¡Sé el primero en compartir tu trabajo!</p>
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
