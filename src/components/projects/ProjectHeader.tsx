'use client'

import { Plus, Code2 } from 'lucide-react'
import { useUIStore } from '@/lib/store'

export function ProjectHeader() {
    const { openProjectModal } = useUIStore()

    return (
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Code2 className="w-5 h-5 text-brand-400" />
                    <h1 className="text-2xl font-black text-white tracking-tight">Showcase de Proyectos</h1>
                </div>
                <p className="text-text-muted text-sm">Inspírate con lo que la comunidad está construyendo.</p>
            </div>

            <button
                onClick={openProjectModal}
                className="btn-primary px-5 py-2.5 rounded-2xl flex items-center gap-2 font-bold text-sm shadow-lg shadow-brand-500/20 active:scale-95 transition-transform shrink-0"
            >
                <Plus className="w-4 h-4" />
                Publicar Proyecto
            </button>
        </header>
    )
}
