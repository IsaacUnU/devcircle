'use client'

import { useTransition } from 'react'
import { X, Calendar, MapPin, Globe, ExternalLink, Send } from 'lucide-react'
import { useUIStore } from '@/lib/store'
import { createEvent } from '@/lib/actions/events'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export function EventModal() {
    const { isEventModalOpen, closeEventModal } = useUIStore()
    const [isPending, startTransition] = useTransition()

    if (!isEventModalOpen) return null

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        startTransition(async () => {
            try {
                await createEvent(formData)
                toast.success('¡Evento creado! 🚀')
                closeEventModal()
                // Forzar actualización de la página actua para reflejar el evento al instante en el cliente
                window.location.reload()
            } catch (err: any) {
                toast.error(err.message ?? 'Error al crear evento')
            }
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 overflow-hidden">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm sm:backdrop-blur-md animate-fade-in" onClick={closeEventModal} />

            <div className="relative w-full sm:max-w-xl bg-surface sm:bg-transparent animate-slide-up mt-auto sm:mt-0 max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-none shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.5)] sm:shadow-none">
                <div className="card p-5 sm:p-6 shadow-2xl glass border-t sm:border border-brand-500/20 overflow-y-auto custom-scrollbar rounded-t-3xl sm:rounded-2xl bg-surface/95 sm:bg-surface/80">
                    <div className="w-12 h-1.5 bg-surface-border rounded-full mx-auto mb-6 sm:hidden" />
                    
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                                <Calendar className="w-6 h-6 text-brand-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-text-primary">Organizar Evento</h2>
                                <p className="text-xs text-text-muted">Anúncialo a toda la comunidad</p>
                            </div>
                        </div>
                        <button type="button" onClick={closeEventModal} className="btn-ghost p-2 -mr-2">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">Título del Evento</label>
                            <input
                                name="title"
                                required
                                placeholder="Ej: React Global Meetup 2026, Hackathon Devora..."
                                className="input h-11"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">Descripción</label>
                            <textarea
                                name="description"
                                placeholder="Comparte detalles, agenda, y por qué no podemos faltar..."
                                className="input h-24 resize-none text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">Tipo</label>
                                <select name="type" required className="input h-11 text-sm bg-surface">
                                    <option value="HACKATHON">Hackathon</option>
                                    <option value="CONFERENCIA">Conferencia</option>
                                    <option value="MEETUP">Meetup</option>
                                    <option value="WORKSHOP">Workshop</option>
                                    <option value="WEBINAR">Webinar</option>
                                    <option value="OTRO">Otro</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">Fecha y Hora de inicio</label>
                                <input
                                    type="datetime-local"
                                    name="startsAt"
                                    required
                                    className="input h-11 text-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">
                                    <ExternalLink className="w-3 h-3" /> URL del Evento (Tickets/Info)
                                </label>
                                <input name="url" placeholder="https://..." className="input text-sm py-2 h-11" />
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">
                                    <MapPin className="w-3 h-3" /> Ubicación
                                </label>
                                <input name="location" required placeholder="Ciudad, Lugar o Enlace" className="input text-sm py-2 h-11" />
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 cursor-pointer p-4 rounded-xl border border-surface-border bg-surface hover:bg-surface-hover transition-colors">
                                <input type="checkbox" name="online" value="true" className="w-4 h-4 rounded text-brand-500 bg-surface-border border-surface-border focus:ring-brand-500 focus:ring-offset-surface" />
                                <span className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                                    <Globe className="w-4 h-4 text-brand-400" />
                                    Es un evento online / virtual
                                </span>
                            </label>
                        </div>

                        <div className="flex items-center justify-end pt-4 border-t border-surface-border">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="btn-primary flex items-center gap-2 px-8"
                            >
                                <Send className="w-4 h-4" />
                                {isPending ? 'Publicando...' : 'Publicar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
