'use client'

import { MapPin, Clock, DollarSign, Building2, ExternalLink } from 'lucide-react'
import { timeAgo } from '@/lib/utils'

export type JobCardType = {
    id: string
    title: string
    company: string
    location: string
    type: string
    salary: string | null
    description: string
    url: string | null
    techStack: string[]
    createdAt: Date
    authorId: string
}

interface JobCardProps {
    job: JobCardType
    onViewDetails: (job: JobCardType) => void
}

export function JobCard({ job, onViewDetails }: JobCardProps) {
    const typeLabels: Record<string, string> = {
        FULL_TIME:  'Full-time',
        PART_TIME:  'Part-time',
        CONTRACT:   'Contrato',
        FREELANCE:  'Freelance',
        INTERNSHIP: 'Prácticas',
    }

    const typeColors: Record<string, string> = {
        FULL_TIME:  'text-green-400 bg-green-400/10',
        PART_TIME:  'text-blue-400 bg-blue-400/10',
        CONTRACT:   'text-yellow-400 bg-yellow-400/10',
        FREELANCE:  'text-purple-400 bg-purple-400/10',
        INTERNSHIP: 'text-pink-400 bg-pink-400/10',
    }

    return (
        <div className="card p-4 sm:p-6 hover:border-brand-500/30 transition-all group">
            <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3 sm:gap-4 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-surface-hover border border-surface-border flex items-center justify-center shrink-0 group-hover:bg-brand-500/5 transition-colors">
                        <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-text-muted group-hover:text-brand-400 transition-colors" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-text-primary group-hover:text-brand-400 transition-colors leading-tight line-clamp-2">
                            {job.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm font-medium text-text-secondary truncate">{job.company}</p>
                            {job.url && (
                                <a href={job.url} target="_blank" rel="noopener noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    className="text-text-muted hover:text-brand-400 transition-colors shrink-0"
                                    title="Ver oferta">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                <span className={`shrink-0 px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${typeColors[job.type] ?? 'text-text-muted bg-surface-hover'}`}>
                    {typeLabels[job.type] ?? job.type}
                </span>
            </div>

            <div className="flex flex-wrap gap-y-2 gap-x-4 mt-5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-brand-400" />
                    {job.location}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-brand-400" />
                    {typeLabels[job.type] ?? job.type}
                </div>
                {job.salary && (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                        <DollarSign className="w-3.5 h-3.5 text-green-500" />
                        {job.salary}
                    </div>
                )}
            </div>

            <p className="mt-4 text-sm text-text-secondary line-clamp-2 leading-relaxed">
                {job.description}
            </p>

            {job.techStack && job.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                    {job.techStack.map(tech => (
                        <span
                            key={tech}
                            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-brand-500/10 text-brand-400 rounded-md"
                        >
                            {tech}
                        </span>
                    ))}
                </div>
            )}

            <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-text-muted font-medium">Publicado {timeAgo(job.createdAt)}</span>
                <button
                    onClick={() => onViewDetails(job)}
                    className="text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors"
                >
                    Ver detalles →
                </button>
            </div>
        </div>
    )
}
