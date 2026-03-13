'use client'

import { useTransition } from 'react'
import { X, Send, Users, Image as ImageIcon } from 'lucide-react'
import { useUIStore } from '@/lib/store'
import { createGroup } from '@/lib/actions/groups'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createGroupSchema, CreateGroup } from '@/lib/validations'

export function GroupModal() {
    const { isGroupModalOpen, closeGroupModal } = useUIStore()
    const [isPending, startTransition] = useTransition()

    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateGroup>({
        resolver: zodResolver(createGroupSchema)
    })

    if (!isGroupModalOpen) return null

    const onSubmit = (data: CreateGroup) => {
        startTransition(async () => {
            try {
                await createGroup(data)
                toast.success('¡Comunidad creada! 🌐')
                reset()
                closeGroupModal()
            } catch (err: any) {
                toast.error(err.message ?? 'Error al crear')
            }
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 overflow-hidden">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm sm:backdrop-blur-md animate-fade-in" onClick={closeGroupModal} />

            <div className="relative w-full sm:max-w-md bg-surface sm:bg-transparent animate-slide-up mt-auto sm:mt-0 max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-none shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.5)] sm:shadow-none">
                <div className="card p-5 sm:p-6 shadow-2xl glass border-t sm:border border-brand-500/20 overflow-y-auto custom-scrollbar rounded-t-3xl sm:rounded-2xl bg-surface/95 sm:bg-surface/80">
                    <div className="w-12 h-1.5 bg-surface-border rounded-full mx-auto mb-6 sm:hidden" />
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                <Users className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-text-primary">Nueva Comunidad</h2>
                                <p className="text-xs text-text-muted">Crea un espacio para desarrolladores</p>
                            </div>
                        </div>
                        <button onClick={closeGroupModal} className="btn-ghost p-2 -mr-2">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">Nombre del Grupo</label>
                            <input
                                {...register('name')}
                                placeholder="Ej: React Experts, Rust Latam..."
                                className={cn("input", errors.name && "border-red-500/50")}
                            />
                            {errors.name && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.name.message}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">Descripción</label>
                            <textarea
                                {...register('description')}
                                placeholder="¿De qué trata este grupo?"
                                className="input h-24 resize-none text-sm"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-1.5 text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">
                                <ImageIcon className="w-3 h-3" /> URL Imagen de Portada
                            </label>
                            <input {...register('image')} placeholder="https://..." className="input text-sm py-2" />
                        </div>

                        <div className="flex items-center justify-end pt-4 border-t border-surface-border">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="btn-primary flex items-center gap-2 px-8 bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/20"
                            >
                                <Send className="w-4 h-4" />
                                {isPending ? 'Creando...' : 'Crear Comunidad'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
