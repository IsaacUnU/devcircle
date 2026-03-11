'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { X, MapPin, Clock, Building2, ExternalLink, Calendar, DollarSign, Send, Pencil, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { deleteJob } from '@/lib/actions/jobs'
import toast from 'react-hot-toast'

export type Job = {
    id: string
    title: string
    company: string
    location: string
    type: string
    salary: string | null
    description: string
    url: string | null
    createdAt: Date
    authorId: string
}

const TYPE_LABELS: Record<string, string> = {
    FULL_TIME:  'Tiempo completo',
    PART_TIME:  'Tiempo parcial',
    CONTRACT:   'Contrato',
    FREELANCE:  'Freelance',
    INTERNSHIP: 'Prácticas',
}

const TYPE_COLORS: Record<string, string> = {
    FULL_TIME:  'text-green-400 bg-green-400/10',
    PART_TIME:  'text-blue-400 bg-blue-400/10',
    CONTRACT:   'text-yellow-400 bg-yellow-400/10',
    FREELANCE:  'text-purple-400 bg-purple-400/10',
    INTERNSHIP: 'text-pink-400 bg-pink-400/10',
}

interface Props {
    job:           Job | null
    currentUserId: string | undefined
    onClose:       () => void
    onEdit:        (job: Job) => void
    onDeleted:     (jobId: string) => void
}

export function JobDetailModal({ job, currentUserId, onClose, onEdit, onDeleted }: Props) {
    const backdropRef              = useRef<HTMLDivElement>(null)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [isPending, startTransition]      = useTransition()

    const isOwner = !!currentUserId && !!job && job.authorId === currentUserId

    useEffect(() => {
        if (!job) return
        setConfirmDelete(false)
        const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handleKey)
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', handleKey)
            document.body.style.overflow = ''
        }
    }, [job, onClose])

    if (!job) return null

    const timeAgo = formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: es })

    const handleDelete = () => {
        startTransition(async () => {
            try {
                await deleteJob(job.id)
                toast.success('Empleo eliminado')
                onDeleted(job.id)
                onClose()
            } catch (err: any) {
                toast.error(err.message ?? 'Error al eliminar')
            }
        })
    }

    return (
        <div
            ref={backdropRef}
            onClick={e => { if (e.target === backdropRef.current) onClose() }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(6px)' }}
        >
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto card shadow-2xl border-brand-500/20">

                {/* Header */}
                <div className="sticky top-0 z-10 flex items-start justify-between gap-4 p-6 pb-4 bg-surface-card border-b border-surface-border">
                    <div className="flex gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-surface-hover border border-surface-border flex items-center justify-center shrink-0">
                            <Building2 className="w-6 h-6 text-brand-400" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-xl font-black text-text-primary truncate">{job.title}</h2>
                            <p className="text-sm font-semibold text-text-secondary mt-0.5">{job.company}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Botones solo para el autor */}
                        {isOwner && (
                            <>
                                <button
                                    onClick={() => onEdit(job)}
                                    className="btn-ghost p-2 text-text-muted hover:text-brand-400 transition-colors"
                                    title="Editar empleo"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                {!confirmDelete ? (
                                    <button
                                        onClick={() => setConfirmDelete(true)}
                                        className="btn-ghost p-2 text-text-muted hover:text-red-400 transition-colors"
                                        title="Eliminar empleo"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={handleDelete}
                                            disabled={isPending}
                                            className="px-3 py-1 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors disabled:opacity-50"
                                        >
                                            {isPending ? '...' : 'Confirmar'}
                                        </button>
                                        <button
                                            onClick={() => setConfirmDelete(false)}
                                            className="px-3 py-1 rounded-lg text-xs font-bold bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
                                        >
                                            No
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                        <button onClick={onClose} className="btn-ghost p-2">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${TYPE_COLORS[job.type] ?? 'text-text-muted bg-surface-hover'}`}>
                            <Clock className="w-3 h-3" />
                            {TYPE_LABELS[job.type] ?? job.type}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 text-text-muted bg-surface-hover">
                            <MapPin className="w-3 h-3 text-brand-400" />
                            {job.location}
                        </span>
                        {job.salary && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 text-yellow-400 bg-yellow-400/10">
                                <DollarSign className="w-3 h-3" />
                                {job.salary}
                            </span>
                        )}
                    </div>

                    <div className="text-xs text-text-muted flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Publicado {timeAgo}
                    </div>

                    <div className="border-t border-surface-border" />

                    <div>
                        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
                            Descripción del puesto
                        </h3>
                        <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                            {job.description}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 p-4 bg-surface-card border-t border-surface-border flex gap-3">
                    {job.url ? (
                        <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm"
                        >
                            <Send className="w-4 h-4" />
                            Aplicar / Ver oferta
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    ) : (
                        <button disabled className="btn-secondary flex-1 py-2.5 rounded-xl font-bold text-sm opacity-50 cursor-not-allowed">
                            Sin enlace de aplicación
                        </button>
                    )}
                    <button onClick={onClose} className="btn-ghost px-5 py-2.5 rounded-xl text-sm font-bold">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    )
}
