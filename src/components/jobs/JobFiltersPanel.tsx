'use client'

import { X } from 'lucide-react'

export type JobFilters = {
    type:     string
    location: string
}

const JOB_TYPES = [
    { value: '',           label: 'Todos los tipos' },
    { value: 'FULL_TIME',  label: 'Tiempo completo' },
    { value: 'PART_TIME',  label: 'Tiempo parcial' },
    { value: 'CONTRACT',   label: 'Contrato' },
    { value: 'FREELANCE',  label: 'Freelance' },
    { value: 'INTERNSHIP', label: 'Prácticas' },
]

interface Props {
    filters:  JobFilters
    onChange: (f: Partial<JobFilters>) => void
    onClose?: () => void
}

export function JobFiltersPanel({ filters, onChange, onClose }: Props) {
    const hasActive = filters.type || filters.location

    return (
        <div className="card p-4 space-y-5">
            <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-text-primary">Filtros</span>
                <div className="flex items-center gap-3">
                    {hasActive && (
                        <button
                            onClick={() => onChange({ type: '', location: '' })}
                            className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
                        >
                            Limpiar todo
                        </button>
                    )}
                    {onClose && (
                        <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Tipo de jornada */}
            <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Tipo de jornada</p>
                <div className="space-y-1">
                    {JOB_TYPES.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => onChange({ type: opt.value })}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                filters.type === opt.value
                                    ? 'text-brand-400 font-bold bg-brand-500/10'
                                    : 'text-text-muted hover:text-text-primary hover:bg-surface-hover'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="border-t border-surface-border" />

            {/* Ubicación libre */}
            <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Ubicación</p>
                <input
                    type="text"
                    value={filters.location}
                    onChange={e => onChange({ location: e.target.value })}
                    placeholder="Remoto, Madrid, Barcelona…"
                    className="input text-sm py-2 w-full"
                />
                {filters.location && (
                    <button
                        onClick={() => onChange({ location: '' })}
                        className="mt-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
                    >
                        × Borrar
                    </button>
                )}
            </div>
        </div>
    )
}
