'use client'

import { Calendar } from 'lucide-react'
import { useUIStore } from '@/lib/store'

export function EventsHeader({ showCreateButton }: { showCreateButton: boolean }) {
    const { openEventModal } = useUIStore()

    return (
        <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-brand-500" />
                    Eventos
                </h1>
                <p className="text-sm text-text-secondary mt-1 max-w-lg">
                    Participa en hackathons, meetups y conferencias exclusivas. Solo los Developers Verificados pueden crear eventos.
                </p>
            </div>

            {showCreateButton && (
                <button 
                  onClick={openEventModal}
                  className="self-start sm:self-auto bg-brand-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-brand-500/20 hover:bg-brand-600 transition-all flex items-center justify-center min-w-[140px]"
                >
                    Crear Evento
                </button>
            )}
        </header>
    )
}
