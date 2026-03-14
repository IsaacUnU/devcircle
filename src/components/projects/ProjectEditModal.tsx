'use client'

import { useState, useTransition, useEffect } from 'react'
import { X, Send, Code2, Link as LinkIcon, Github, Image as ImageIcon } from 'lucide-react'
import { updateProject } from '@/lib/actions/projects'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createProjectSchema, CreateProject } from '@/lib/validations'

type ProjectData = {
    id: string
    title: string
    description: string | null
    url: string | null
    repoUrl: string | null
    image: string | null
    techStack: string[]
    ownerId: string
}

interface Props {
    project: ProjectData
    onClose: () => void
    onUpdated: (project: ProjectData) => void
}

export function ProjectEditModal({ project, onClose, onUpdated }: Props) {
    const [isPending, startTransition] = useTransition()
    const [tagInput, setTagInput] = useState('')

    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<CreateProject>({
        resolver: zodResolver(createProjectSchema),
        defaultValues: {
            title: project.title,
            description: project.description ?? '',
            url: project.url ?? '',
            repoUrl: project.repoUrl ?? '',
            image: project.image ?? '',
            techStack: project.techStack,
        }
    })

    const techStack = watch('techStack')

    useEffect(() => {
        reset({
            title: project.title,
            description: project.description ?? '',
            url: project.url ?? '',
            repoUrl: project.repoUrl ?? '',
            image: project.image ?? '',
            techStack: project.techStack,
        })
    }, [project.id, reset])

    function addTag(e: React.KeyboardEvent) {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            const tag = tagInput.trim().toLowerCase()
            if (tag && !techStack.includes(tag) && techStack.length < 10) {
                setValue('techStack', [...techStack, tag])
                setTagInput('')
            }
        }
    }

    function removeTag(tag: string) {
        setValue('techStack', techStack.filter(t => t !== tag))
    }

    const onSubmit = (data: CreateProject) => {
        startTransition(async () => {
            try {
                const updated = await updateProject(project.id, data)
                toast.success('¡Proyecto actualizado! ✏️')
                onUpdated({ ...project, ...updated })
                onClose()
            } catch (err: any) {
                toast.error(err.message ?? 'Error al actualizar')
            }
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 overflow-hidden">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm sm:backdrop-blur-md animate-fade-in" onClick={onClose} />

            <div className="relative w-full sm:max-w-xl bg-surface sm:bg-transparent animate-slide-up mt-auto sm:mt-0 max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-none shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.5)] sm:shadow-none">
                <div className="card p-5 sm:p-6 shadow-2xl glass border-t sm:border border-brand-500/20 overflow-y-auto custom-scrollbar rounded-t-3xl sm:rounded-2xl bg-surface/95 sm:bg-surface/80">
                    <div className="w-12 h-1.5 bg-surface-border rounded-full mx-auto mb-6 sm:hidden" />
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                                <Code2 className="w-6 h-6 text-brand-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-text-primary">Editar Proyecto</h2>
                                <p className="text-xs text-text-muted">Modifica los datos de tu proyecto</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="btn-ghost p-2 -mr-2">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">Título del Proyecto</label>
                            <input
                                {...register('title')}
                                placeholder="Ej: Devora, Mi Portafolio, etc."
                                className={cn("input", errors.title && "border-red-500/50")}
                            />
                            {errors.title && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.title.message}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">Descripción</label>
                            <textarea
                                {...register('description')}
                                placeholder="Explica de qué trata tu proyecto, qué problemas resuelve..."
                                className="input h-24 resize-none text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">
                                    <LinkIcon className="w-3 h-3" /> URL Demo
                                </label>
                                <input {...register('url')} placeholder="https://..." className="input text-sm py-2" />
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">
                                    <Github className="w-3 h-3" /> Repositorio
                                </label>
                                <input {...register('repoUrl')} placeholder="https://github.com/..." className="input text-sm py-2" />
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-1.5 text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">
                                <ImageIcon className="w-3 h-3" /> URL Imagen de Portada
                            </label>
                            <input {...register('image')} placeholder="https://..." className="input text-sm py-2" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">Stack Tecnológico</label>
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {techStack.map(tag => (
                                    <button type="button" key={tag} onClick={() => removeTag(tag)} className="tag group">
                                        {tag}
                                        <X className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                ))}
                            </div>
                            <input
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                onKeyDown={addTag}
                                placeholder="Presiona Enter para añadir (ej: react, tailwind...)"
                                className="input py-2 text-sm"
                            />
                            <p className="text-[10px] text-text-muted mt-1 ml-1">{techStack.length}/10 tecnologías</p>
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
