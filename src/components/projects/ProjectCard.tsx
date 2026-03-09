'use client'

import { ExternalLink, Github, Globe, Code2 } from 'lucide-react'
import { getAvatarUrl, cn } from '@/lib/utils'
import Link from 'next/link'

interface ProjectCardProps {
    project: {
        id: string
        title: string
        description: string | null
        url: string | null
        repoUrl: string | null
        image: string | null
        techStack: string[]
        owner: {
            username: string
            name: string | null
            image: string | null
        }
    }
}

export function ProjectCard({ project }: ProjectCardProps) {
    return (
        <div className="card group overflow-hidden flex flex-col h-full hover:border-brand-500/50 transition-all duration-300">
            {/* Thumbnail */}
            <div className="relative aspect-video w-full bg-surface-hover overflow-hidden">
                {project.image ? (
                    <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-brand-500/5">
                        <Code2 className="w-12 h-12 text-brand-500/20" />
                    </div>
                )}

                {/* Links Overlay */}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {project.url && (
                        <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-brand-500 text-white rounded-full hover:scale-110 transition-transform"
                            title="Ver Demo"
                        >
                            <Globe className="w-5 h-5" />
                        </a>
                    )}
                    {project.repoUrl && (
                        <a
                            href={project.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-surface text-text-primary rounded-full hover:scale-110 transition-transform"
                            title="Ver Repositorio"
                        >
                            <Github className="w-5 h-5" />
                        </a>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg font-bold text-text-primary group-hover:text-brand-400 transition-colors">
                        {project.title}
                    </h3>
                </div>

                <p className="text-sm text-text-muted line-clamp-2 mb-4 flex-1">
                    {project.description || 'Sin descripción disponible.'}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                    {project.techStack.map(tech => (
                        <span
                            key={tech}
                            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-brand-500/10 text-brand-400 rounded-md"
                        >
                            {tech}
                        </span>
                    ))}
                </div>

                {/* Footer / Owner */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <Link
                        href={`/profile/${project.owner.username}`}
                        className="flex items-center gap-2 group/owner"
                    >
                        <img
                            src={project.owner.image ?? getAvatarUrl(project.owner.username)}
                            alt=""
                            className="w-6 h-6 rounded-full border border-white/10"
                        />
                        <span className="text-xs font-medium text-text-secondary group-hover/owner:text-text-primary transition-colors">
                            {project.owner.name ?? project.owner.username}
                        </span>
                    </Link>
                    <div className="text-[10px] text-text-muted font-medium">
                        Proyectazo ✨
                    </div>
                </div>
            </div>
        </div>
    )
}
