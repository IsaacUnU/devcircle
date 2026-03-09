'use client'

import { MapPin, Clock, DollarSign, Building2, ExternalLink } from 'lucide-react'
import { cn, timeAgo } from '@/lib/utils'

interface JobCardProps {
    job: {
        id: string
        title: string
        company: string
        location: string
        type: string
        salary: string | null
        description: string
        createdAt: Date
    }
}

export function JobCard({ job }: JobCardProps) {
    const typeLabels: Record<string, string> = {
        'FULL_TIME': 'Full-time',
        'PART_TIME': 'Part-time',
        'CONTRACT': 'Contract',
        'FREELANCE': 'Freelance',
        'INTERNSHIP': 'Internship',
    }

    return (
        <div className="card p-6 hover:border-brand-500/30 transition-all group cursor-pointer">
            <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-surface-hover border border-surface-border flex items-center justify-center shrink-0 group-hover:bg-brand-500/5 transition-colors">
                        <Building2 className="w-6 h-6 text-text-muted group-hover:text-brand-400 transition-colors" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-text-primary group-hover:text-brand-400 transition-colors leading-tight">
                            {job.title}
                        </h3>
                        <p className="text-sm font-medium text-text-secondary mt-1">{job.company}</p>
                    </div>
                </div>
                <button className="p-2 rounded-xl bg-surface-hover border border-surface-border hover:bg-brand-500/10 hover:border-brand-500/30 transition-all">
                    <ExternalLink className="w-4 h-4 text-text-muted" />
                </button>
            </div>

            <div className="flex flex-wrap gap-y-2 gap-x-4 mt-5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-brand-400" />
                    {job.location}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-brand-400" />
                    {typeLabels[job.type] || job.type}
                </div>
                {job.salary && (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                        <DollarSign className="w-3.5 h-3.5 text-green-500" />
                        {job.salary}
                    </div>
                )}
            </div>

            <div className="mt-4">
                <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">
                    {job.description}
                </p>
            </div>

            <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-text-muted font-medium">Publicado {timeAgo(job.createdAt)}</span>
                <button className="text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors">
                    Ver detalles →
                </button>
            </div>
        </div>
    )
}
