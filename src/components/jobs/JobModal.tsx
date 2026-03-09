'use client'

import { useTransition } from 'react'
import { X, Send, Briefcase, Building2, MapPin, DollarSign } from 'lucide-react'
import { useUIStore } from '@/lib/store'
import { createJob } from '@/lib/actions/jobs'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createJobSchema, CreateJob } from '@/lib/validations'

export function JobModal() {
    const { isJobModalOpen, closeJobModal } = useUIStore()
    const [isPending, startTransition] = useTransition()

    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateJob>({
        resolver: zodResolver(createJobSchema),
        defaultValues: { type: 'FULL_TIME' }
    })

    if (!isJobModalOpen) return null

    const onSubmit = (data: CreateJob) => {
        startTransition(async () => {
            try {
                await createJob(data)
                toast.success('¡Oferta publicada! 💼')
                reset()
                closeJobModal()
            } catch (err: any) {
                toast.error(err.message ?? 'Error al publicar')
            }
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto custom-scrollbar">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md animate-fade-in" onClick={closeJobModal} />

            <div className="relative w-full max-w-xl animate-slide-up my-auto">
                <div className="card p-6 shadow-2xl glass border-brand-500/20">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                <Briefcase className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-text-primary">Publicar Empleo</h2>
                                <p className="text-xs text-text-muted">Busca el mejor talento para tu equipo</p>
                            </div>
                        </div>
                        <button onClick={closeJobModal} className="btn-ghost p-2 -mr-2">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">Título del Puesto</label>
                                <input {...register('title')} placeholder="Ej: Senior Frontend Dev" className="input text-sm py-2" />
                                {errors.title && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.title.message}</p>}
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">
                                    <Building2 className="w-3 h-3" /> Empresa
                                </label>
                                <input {...register('company')} placeholder="Nombre de la empresa" className="input text-sm py-2" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">
                                    <MapPin className="w-3 h-3" /> Ubicación
                                </label>
                                <input {...register('location')} placeholder="Remoto, Madrid, etc." className="input text-sm py-2" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">Tipo de Jornada</label>
                                <select {...register('type')} className="input text-sm py-2">
                                    <option value="FULL_TIME">Full Time</option>
                                    <option value="PART_TIME">Part Time</option>
                                    <option value="CONTRACT">Contract</option>
                                    <option value="FREELANCE">Freelance</option>
                                    <option value="INTERNSHIP">Internship</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">
                                    <DollarSign className="w-3 h-3" /> Salario (Opcional)
                                </label>
                                <input {...register('salary')} placeholder="40k - 50k €" className="input text-sm py-2" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">URL de la Oferta</label>
                                <input {...register('url')} placeholder="https://..." className="input text-sm py-2" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">Descripción del Puesto</label>
                            <textarea
                                {...register('description')}
                                placeholder="Requisitos, responsabilidades, beneficios..."
                                className="input h-32 resize-none text-sm"
                            />
                        </div>

                        <div className="flex items-center justify-end pt-4 border-t border-surface-border">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="btn-primary flex items-center gap-2 px-8 bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/20"
                            >
                                <Send className="w-4 h-4" />
                                {isPending ? 'Publicando...' : 'Publicar Oferta'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
