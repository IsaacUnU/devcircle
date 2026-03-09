'use client'

import { Users, ArrowRight, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GroupCardProps {
    group: {
        id: string
        name: string
        description: string | null
        image: string | null
        _count: { members: number }
    }
}

export function GroupCard({ group }: GroupCardProps) {
    return (
        <div className="card group overflow-hidden hover:border-brand-500/30 transition-all cursor-pointer">
            <div className="relative h-24 bg-gradient-to-r from-brand-600/40 to-brand-400/20">
                {group.image && (
                    <img
                        src={group.image}
                        alt={group.name}
                        className="w-full h-full object-cover mix-blend-overlay opacity-50 group-hover:scale-105 transition-transform duration-700"
                    />
                )}
                <div className="absolute -bottom-6 left-6 p-3 rounded-2xl bg-surface border border-surface-border shadow-xl group-hover:border-brand-500/30 transition-colors">
                    <Users className="w-6 h-6 text-brand-400" />
                </div>
            </div>

            <div className="p-6 pt-10">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-text-primary group-hover:text-brand-400 transition-colors">
                        {group.name}
                    </h3>
                    <div className="flex items-center gap-1 text-[10px] font-black text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-md">
                        <Star className="w-3 h-3 fill-brand-400" />
                        TOP
                    </div>
                </div>

                <p className="text-sm text-text-muted line-clamp-2 mb-6 leading-relaxed">
                    {group.description || 'Sin descripción para esta comunidad.'}
                </p>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="w-6 h-6 rounded-full border-2 border-surface bg-surface-hover shrink-0" />
                            ))}
                        </div>
                        <span className="text-xs font-bold text-text-secondary">{group._count.members} miembros</span>
                    </div>

                    <button className="flex items-center gap-1 text-xs font-black text-brand-400 group-hover:gap-2 transition-all">
                        UNIRSE <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    )
}
