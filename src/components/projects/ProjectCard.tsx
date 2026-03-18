'use client'

import { useState, useRef, useEffect } from 'react'
import { ExternalLink, Github, Globe, Code2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { getAvatarUrl, cn } from '@/lib/utils'
import { deleteProject } from '@/lib/actions/projects'
import { ProjectEditModal } from './ProjectEditModal'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface ProjectCardProps {
    project: {
        id: string
        title: string
        description: string | null
        url: string | null
        repoUrl: string | null
        image: string | null
        techStack: string[]
        ownerId: string
        owner: {
            username: string
            name: string | null
            image: string | null
        }
    }
    currentUserId?: string
    onDeleted?: (id: string) => void
    onUpdated?: (project: any) => void
}

export function ProjectCard({ project, currentUserId, onDeleted, onUpdated }: ProjectCardProps) {
    const [menuOpen, setMenuOpen] = useState(false)
    const [editing, setEditing] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    const isOwner = currentUserId === project.ownerId

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
        }
        if (menuOpen) document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [menuOpen])

    async function handleDelete() {
        if (!confirm('¿Eliminar este proyecto? Esta acción no se puede deshacer.')) return
        setIsDeleting(true)
        try {
            await deleteProject(project.id)
            toast.success('Proyecto eliminado')
            onDeleted?.(project.id)
        } catch (err: any) {
            toast.error(err.message ?? 'Error al eliminar')
        } finally {
            setIsDeleting(false)
            setMenuOpen(false)
        }
    }

    if (isDeleting) return null

    return (
        <>
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

                    {/* Owner Menu */}
                    {isOwner && (
                        <div ref={menuRef} className="absolute top-2 right-2 z-10">
                            <button
                                onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
                                className="p-1.5 bg-black/50 backdrop-blur-sm rounded-lg text-white/70 hover:text-white transition-colors"
                            >
                                <MoreHorizontal className="w-4 h-4" />
                            </button>

                            {menuOpen && (
                                <div className="absolute right-0 top-full mt-1 w-40 bg-surface border border-surface-border rounded-xl shadow-xl py-1 animate-fade-in">
                                    <button
                                        onClick={() => { setMenuOpen(false); setEditing(true) }}
                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
                                    >
                                        <Pencil className="w-3.5 h-3.5" /> Editar
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Eliminar
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
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
                                className="w-6 h-6 rounded-full object-cover border border-white/10"
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

            {/* Edit Modal */}
            {editing && (
                <ProjectEditModal
                    project={project}
                    onClose={() => setEditing(false)}
                    onUpdated={(updated) => onUpdated?.(updated)}
                />
            )}
        </>
    )
}
