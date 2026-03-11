'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Briefcase, Search, SlidersHorizontal, Loader2, X } from 'lucide-react'
import { JobCard, JobCardType } from '@/components/jobs/JobCard'
import { JobDetailModal, Job } from '@/components/jobs/JobDetailModal'
import { JobEditModal } from '@/components/jobs/JobEditModal'
import { JobFiltersPanel, JobFilters } from '@/components/jobs/JobFiltersPanel'

const DEFAULT_FILTERS: JobFilters = { type: '', location: '' }

interface Props {
    initialJobs:   JobCardType[]
    currentUserId: string | undefined
}

export function JobsList({ initialJobs, currentUserId }: Props) {
    const [jobs, setJobs]               = useState<JobCardType[]>(initialJobs)
    const [total, setTotal]             = useState(initialJobs.length)
    const [loading, setLoading]         = useState(false)
    const [query, setQuery]             = useState('')
    const [filters, setFilters]         = useState<JobFilters>(DEFAULT_FILTERS)
    const [showFilters, setShowFilters] = useState(false)
    const [selectedJob, setSelectedJob] = useState<Job | null>(null)
    const [editingJob, setEditingJob]   = useState<Job | null>(null)
    const debounceRef                   = useRef<NodeJS.Timeout>()
    const isFirstRender                 = useRef(true)

    const hasActiveFilters = filters.type || filters.location
    const activeCount      = [filters.type, filters.location].filter(Boolean).length

    const fetchJobs = useCallback(async (q: string, f: JobFilters) => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (q)          params.set('q',        q)
            if (f.type)     params.set('type',     f.type)
            if (f.location) params.set('location', f.location)
            const res  = await fetch(`/api/jobs?${params}`)
            const data = await res.json()
            setJobs(data.jobs  ?? [])
            setTotal(data.total ?? 0)
        } catch { /* silencio */ }
        finally  { setLoading(false) }
    }, [])

    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return }
        clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => fetchJobs(query, filters), 350)
        return () => clearTimeout(debounceRef.current)
    }, [query, filters, fetchJobs])

    const handleFilter = (partial: Partial<JobFilters>) =>
        setFilters(prev => ({ ...prev, ...partial }))

    // Cuando se actualiza un empleo, reflejar en la lista y en el modal de detalle
    const handleUpdated = (updated: Job) => {
        setJobs(prev => prev.map(j => j.id === updated.id ? { ...j, ...updated } : j))
        setSelectedJob(updated)
        setEditingJob(null)
    }

    // Cuando se elimina, quitarlo de la lista
    const handleDeleted = (jobId: string) => {
        setJobs(prev => prev.filter(j => j.id !== jobId))
        setTotal(prev => prev - 1)
        setSelectedJob(null)
    }

    return (
        <>
            {/* Search + Filters bar */}
            <div className="flex gap-2 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Buscar por cargo, empresa o tecnología..."
                        className="w-full bg-surface-hover border border-surface-border rounded-xl py-2.5 pl-11 pr-10 text-sm outline-none focus:border-brand-500/50 transition-colors"
                    />
                    {query && (
                        <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <button
                    onClick={() => setShowFilters(v => !v)}
                    className={`relative px-4 py-2.5 border rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${
                        showFilters || hasActiveFilters
                            ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
                            : 'bg-surface-hover border-surface-border text-text-primary hover:bg-white/5'
                    }`}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filtros
                    {activeCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-brand-500 text-black text-[10px] font-black flex items-center justify-center">
                            {activeCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Active filter chips */}
            {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mb-5">
                    {filters.type && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                            {filters.type.replace('_', ' ')}
                            <button onClick={() => handleFilter({ type: '' })}><X className="w-3 h-3" /></button>
                        </span>
                    )}
                    {filters.location && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                            📍 {filters.location}
                            <button onClick={() => handleFilter({ location: '' })}><X className="w-3 h-3" /></button>
                        </span>
                    )}
                </div>
            )}

            <div className="flex gap-6">
                {/* Jobs list */}
                <div className="flex-1 space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
                            <p className="text-sm text-text-muted">Buscando oportunidades…</p>
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="py-20 text-center">
                            <div className="w-16 h-16 bg-surface-hover rounded-3xl flex items-center justify-center mx-auto mb-4 border border-surface-border">
                                <Briefcase className="w-8 h-8 text-text-muted" />
                            </div>
                            <p className="text-text-primary font-bold">
                                {query || hasActiveFilters ? 'Sin resultados' : 'No hay empleos disponibles'}
                            </p>
                            <p className="text-text-muted text-sm mt-1">
                                {query || hasActiveFilters
                                    ? 'Prueba con otros términos o cambia los filtros'
                                    : 'Vuelve pronto para ver nuevas oportunidades.'}
                            </p>
                            {(query || hasActiveFilters) && (
                                <button
                                    onClick={() => { setQuery(''); setFilters(DEFAULT_FILTERS) }}
                                    className="mt-4 text-sm text-brand-400 hover:text-brand-300 font-bold"
                                >
                                    Limpiar búsqueda
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <p className="text-xs text-text-muted mb-2">
                                {total} oferta{total !== 1 ? 's' : ''} encontrada{total !== 1 ? 's' : ''}
                            </p>
                            {jobs.map(job => (
                                <JobCard key={job.id} job={job} onViewDetails={j => setSelectedJob(j as Job)} />
                            ))}
                        </>
                    )}
                </div>

                {/* Filters sidebar (desktop) */}
                {showFilters && (
                    <div className="w-56 shrink-0 hidden md:block">
                        <div className="sticky top-24">
                            <JobFiltersPanel filters={filters} onChange={handleFilter} onClose={() => setShowFilters(false)} />
                        </div>
                    </div>
                )}
            </div>

            {/* Job Detail Modal */}
            <JobDetailModal
                job={selectedJob}
                currentUserId={currentUserId}
                onClose={() => setSelectedJob(null)}
                onEdit={job => { setEditingJob(job); setSelectedJob(null) }}
                onDeleted={handleDeleted}
            />

            {/* Job Edit Modal */}
            {editingJob && (
                <JobEditModal
                    job={editingJob}
                    onClose={() => setEditingJob(null)}
                    onUpdated={handleUpdated}
                />
            )}

            {/* Filters bottom sheet (móvil) */}
            {showFilters && (
                <div
                    className="md:hidden fixed inset-0 z-40 flex flex-col justify-end"
                    style={{ background: 'rgba(0,0,0,0.6)' }}
                    onClick={() => setShowFilters(false)}
                >
                    <div onClick={e => e.stopPropagation()} className="p-4 rounded-t-2xl bg-surface-card border-t border-surface-border">
                        <JobFiltersPanel filters={filters} onChange={handleFilter} onClose={() => setShowFilters(false)} />
                    </div>
                </div>
            )}
        </>
    )
}
