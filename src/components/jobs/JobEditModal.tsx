'use client'

import { useTransition, useEffect } from 'react'
import { X, Send, Briefcase, Building2, MapPin, DollarSign, Link } from 'lucide-react'
import { updateJob } from '@/lib/actions/jobs'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createJobSchema, CreateJob } from '@/lib/validations'

type Job = {
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

interface Props {
    job: Job
    onClose: () => void
    onUpdated: (job: Job) => void
}

export function JobEditModal({ job, onClose, onUpdated }: Props) {
    const [isPending, startTransition] = useTransition()

    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateJob>({
        resolver: zodResolver(createJobSchema),
        defaultValues: {
            title:       job.title,
            company:     job.company,
            location:    job.location,
            type:        job.type as any,
            salary:      job.salary ?? '',
            description: job.description,
            url:         job.url ?? '',
        },
    })

    // Sync si cambia el job (por si se abre con otro)
    useEffect(() => {
        reset({
            title:       job.title,
            company:     job.company,
            location:    job.location,
            type:        job.type as any,
            salary:      job.salary ?? '',
            description: job.description,
            url:         job.url ?? '',
        })
    }, [job.id, reset])

    const onSubmit = (data: CreateJob) => {
        startTransition(async () => {
            try {
                const updated = await updateJob(job.id, data)
                toast.success('¡Empleo actualizado! ✏️')
                onUpdated({ ...job, ...updated })
                onClose()
            } catch (err: any) {
                toast.error(err.message ?? 'Error al actualizar')
            }
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto custom-scrollbar">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-xl my-auto animate-slide-up">
                <div className="card p-6 shadow-2xl glass border-brand-500/20">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                                <Briefcase className="w-6 h-6 text-brand-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-text-primary">Editar Empleo</h2>
                                <p className="text-xs text-text-muted">Modifica los datos de tu oferta</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="btn-ghost p-2 -mr-2">
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
                                {errors.company && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.company.message}</p>}
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
                                    <option value="CONTRACT">Contrato</option>
                                    <option value="FREELANCE">Freelance</option>
                                    <option value="INTERNSHIP">Prácticas</option>
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
                                <label className="flex items-center gap-1.5 text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">
                                    <Link className="w-3 h-3" /> URL de la Oferta
                                </label>
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
                            {errors.description && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.description.message}</p>}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
                            <button type="button" onClick={onClose} className="btn-ghost px-5 py-2 text-sm font-bold">
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="btn-primary flex items-center gap-2 px-8"
                            >
                                <Send className="w-4 h-4" />
                                {isPending ? 'Guardando...' : 'Guardar cambios'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
