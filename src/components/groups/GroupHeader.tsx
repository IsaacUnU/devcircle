'use client'

import { Plus, Users } from 'lucide-react'
import { useUIStore } from '@/lib/store'

export function GroupHeader() {
    const { openGroupModal } = useUIStore()

    return (
        <header className="mb-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Users className="w-5 h-5 text-brand-400" />
                        <h1 className="text-2xl font-black text-white tracking-tight">Comunidades</h1>
                    </div>
                    <p className="text-text-muted text-sm">Encuentra y únete a grupos de desarrolladores con tus mismos intereses.</p>
                </div>

                <button
                    onClick={openGroupModal}
                    className="btn-primary px-5 py-2.5 rounded-2xl flex items-center gap-2 font-bold text-sm shadow-lg shadow-brand-500/20 active:scale-95 transition-transform"
                >
                    <Plus className="w-4 h-4" />
                    Crear Grupo
                </button>
            </div>
        </header>
    )
}
