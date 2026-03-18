import { auth } from '@/lib/auth'
import { getProjects, getFeaturedProject, getSuggestedUsers, getTrendingTags, getTopContributors } from '@/lib/queries'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { RightSidebar } from '@/components/layout/RightSidebar'
import { ProjectHeader } from '@/components/projects/ProjectHeader'
import { Sparkles, Code2, ExternalLink, Github } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Proyectos',
    description: 'Descubre y comparte proyectos increíbles creados por la comunidad de Devora.',
}

export default async function ProjectsPage() {
    const [session, projects, featured, suggested, trending, topDevs] = await Promise.all([
        auth(),
        getProjects(),
        getFeaturedProject(),
        getSuggestedUsers(),
        getTrendingTags(),
        getTopContributors(),
    ])

    return (
        <div className="flex-1 flex max-w-[1240px] mx-auto">
            <main className="flex-1 px-4 sm:px-6 py-4 sm:py-8 border-x border-surface-border min-h-screen">
                <ProjectHeader />

                {/* Featured Section — Dynamic */}
                {featured && (
                    <section className="mb-8 rounded-2xl sm:rounded-3xl bg-surface border border-brand-500/15 relative overflow-hidden group animate-fade-in">
                        {/* Image — full width top */}
                        <div className="relative w-full aspect-[21/9] bg-black/60 overflow-hidden">
                            {featured.image ? (
                                <img
                                    src={featured.image}
                                    alt={featured.title}
                                    className="w-full h-full object-cover opacity-90 group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-600/20 to-purple-600/10">
                                    <Code2 className="w-20 h-20 text-brand-500/15" />
                                </div>
                            )}
                            {/* Badge overlay */}
                            <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-brand-400 text-[11px] font-bold uppercase tracking-widest">
                                <Sparkles className="w-3.5 h-3.5" />
                                Destacado
                            </div>
                            {/* Gradient overlay bottom */}
                            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface to-transparent" />
                        </div>

                        {/* Content */}
                        <div className="relative z-10 px-5 sm:px-7 pb-6 -mt-6">
                            <h2 className="text-lg sm:text-2xl font-black text-text-primary mb-2 leading-tight">
                                {featured.title}
                            </h2>
                            {featured.description && (
                                <p className="text-sm text-text-secondary mb-4 leading-relaxed line-clamp-2 max-w-lg">
                                    {featured.description}
                                </p>
                            )}

                            {/* Tech Stack */}
                            {featured.techStack.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-5">
                                    {featured.techStack.slice(0, 6).map(tech => (
                                        <span key={tech} className="tag text-[10px]">{tech}</span>
                                    ))}
                                </div>
                            )}

                            {/* Divider */}
                            <div className="border-t border-surface-border pt-4 flex items-center justify-between gap-3">
                                {/* Creator */}
                                <Link
                                    href={`/profile/${featured.owner.username}`}
                                    className="flex items-center gap-2.5 group/owner min-w-0"
                                >
                                    <img
                                        src={featured.owner.image ?? `https://api.dicebear.com/8.x/initials/svg?seed=${featured.owner.username}`}
                                        alt=""
                                        className="w-9 h-9 rounded-full border-2 border-surface-border group-hover/owner:border-brand-500/50 transition-all shrink-0"
                                    />
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-text-primary truncate group-hover/owner:text-brand-400 transition-colors">
                                            {featured.owner.name ?? featured.owner.username}
                                        </p>
                                        <p className="text-[11px] text-text-muted truncate">@{featured.owner.username}</p>
                                    </div>
                                </Link>

                                {/* Action Buttons — compact pills */}
                                <div className="flex items-center gap-2 shrink-0">
                                    {featured.repoUrl && (
                                        <a
                                            href={featured.repoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-text-secondary text-xs font-medium hover:bg-white/10 border border-white/5 transition-all"
                                        >
                                            <Github className="w-3.5 h-3.5" />
                                            Repo
                                        </a>
                                    )}
                                    {featured.url && (
                                        <a
                                            href={featured.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-500 text-white text-xs font-semibold hover:brightness-110 transition-all"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                            Ver
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Decoration glows */}
                        <div className="absolute -top-16 -right-16 w-48 h-48 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none" />
                        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple-500/8 rounded-full blur-[100px] pointer-events-none" />
                    </section>
                )}

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-children">
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
