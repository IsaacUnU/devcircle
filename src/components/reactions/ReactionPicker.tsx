'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { Heart, Flame, Zap, Lightbulb, Rocket, Eye, Smile } from 'lucide-react'
import { toggleReaction, type ReactionType } from '@/lib/actions/reactions'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

// Configuración visual de cada tipo de reacción
export const REACTION_CONFIG: Record<
  ReactionType,
  { icon: React.ElementType; label: string; activeColor: string; hoverBg: string }
> = {
  HEART:  { icon: Heart,     label: 'Me gusta',    activeColor: 'text-rose-400',   hoverBg: 'hover:bg-rose-400/10'   },
  FIRE:   { icon: Flame,     label: 'En llamas',   activeColor: 'text-orange-400', hoverBg: 'hover:bg-orange-400/10' },
  ZAPPER: { icon: Zap,       label: 'Brillante',   activeColor: 'text-yellow-400', hoverBg: 'hover:bg-yellow-400/10' },
  BULB:   { icon: Lightbulb, label: 'Gran idea',   activeColor: 'text-sky-400',    hoverBg: 'hover:bg-sky-400/10'    },
  ROCKET: { icon: Rocket,    label: 'Al infinito', activeColor: 'text-brand-400',  hoverBg: 'hover:bg-brand-400/10'  },
  EYES:   { icon: Eye,       label: 'Interesante', activeColor: 'text-purple-400', hoverBg: 'hover:bg-purple-400/10' },
}

const REACTION_TYPES = Object.keys(REACTION_CONFIG) as ReactionType[]

interface ReactionSummary { type: ReactionType; count: number }

interface ReactionPickerProps {
  postId:         string
  reactions:      ReactionSummary[]
  myReaction:     ReactionType | null
  currentUserId?: string
}

export function ReactionPicker({
  postId,
  reactions,
  myReaction,
  currentUserId,
}: ReactionPickerProps) {
  const [open,           setOpen]          = useState(false)
  const [localMine,      setLocalMine]     = useState<ReactionType | null>(myReaction)
  const [localCounts,    setLocalCounts]   = useState<Record<string, number>>(() => {
    const m: Record<string, number> = {}
    for (const r of reactions) m[r.type] = r.count
    return m
  })
  const [isPending, startTransition] = useTransition()
  const pickerRef = useRef<HTMLDivElement>(null)

  // Cerrar picker al hacer click fuera
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Lógica central de toggle ──────────────────────────────────────────────
  function applyReaction(type: ReactionType, prevMine: ReactionType | null): {
    newMine: ReactionType | null
    newCounts: Record<string, number>
  } {
    const newCounts = { ...localCounts }
    let newMine: ReactionType | null

    if (prevMine === type) {
      // QUITAR — mismo tipo: toggle off
      newMine = null
      newCounts[type] = Math.max(0, (newCounts[type] ?? 0) - 1)
      if (newCounts[type] === 0) delete newCounts[type]
    } else {
      // CAMBIAR o AÑADIR
      if (prevMine) {
        // Quitar la anterior
        newCounts[prevMine] = Math.max(0, (newCounts[prevMine] ?? 0) - 1)
        if (newCounts[prevMine] === 0) delete newCounts[prevMine]
      }
      // Añadir la nueva
      newMine = type
      newCounts[type] = (newCounts[type] ?? 0) + 1
    }

    return { newMine, newCounts }
  }

  function handleReact(type: ReactionType) {
    if (!currentUserId) { toast.error('Inicia sesión para reaccionar'); return }
    setOpen(false)

    // Snapshot para revertir si falla
    const prevMine   = localMine
    const prevCounts = { ...localCounts }

    // Optimistic update
    const { newMine, newCounts } = applyReaction(type, prevMine)
    setLocalMine(newMine)
    setLocalCounts(newCounts)

    startTransition(async () => {
      try {
        await toggleReaction(postId, type)
      } catch {
        // Revertir
        setLocalMine(prevMine)
        setLocalCounts(prevCounts)
        toast.error('Error al reaccionar')
      }
    })
  }

  // Pills de reacciones con conteo > 0, ordenados por popularidad
  const activePills = REACTION_TYPES
    .filter(t => (localCounts[t] ?? 0) > 0)
    .sort((a, b) => (localCounts[b] ?? 0) - (localCounts[a] ?? 0))
    .slice(0, 3)

  const myConfig = localMine ? REACTION_CONFIG[localMine] : null
  const MyIcon   = myConfig?.icon

  const totalCount = Object.values(localCounts).reduce((s, v) => s + v, 0)

  return (
    <div className="relative flex items-center gap-1" ref={pickerRef}>

      {/* Pills de reacciones activas */}
      {activePills.map(type => {
        const cfg  = REACTION_CONFIG[type]
        const Icon = cfg.icon
        const isMe = localMine === type
        const count = localCounts[type] ?? 0
        return (
          <button
            key={type}
            onClick={() => handleReact(type)}
            disabled={isPending}
            title={isMe ? `Quitar "${cfg.label}"` : `Reaccionar con "${cfg.label}"`}
            className={cn(
              'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all duration-150 border',
              isMe
                ? `${cfg.activeColor} border-current/40 bg-current/10 font-medium`
                : 'text-text-muted border-surface-border hover:border-surface-hover'
            )}
          >
            <Icon className={cn('w-3 h-3', isMe && 'fill-current')} />
            <span>{count}</span>
          </button>
        )
      })}

      {/* Botón abre picker — muestra mi reacción activa o el icono de reaccionar */}
      <div className="relative">
        <button
          onClick={() => setOpen(p => !p)}
          disabled={isPending}
          title={localMine ? `Mi reacción: ${REACTION_CONFIG[localMine].label}` : 'Reaccionar'}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-all duration-150',
            open
              ? 'bg-surface-hover text-text-primary'
              : myConfig
                ? `${myConfig.activeColor} bg-current/10`
                : 'text-text-muted hover:text-text-primary hover:bg-surface-hover'
          )}
        >
          {MyIcon
            ? <MyIcon className={cn('w-4 h-4 fill-current')} />
            : <Smile className="w-4 h-4" />
          }
          {/* Total si hay reacciones y no hay pills visibles */}
          {totalCount > 0 && activePills.length === 0 && (
            <span className="text-xs tabular-nums">{totalCount}</span>
          )}
        </button>

        {/* Picker flotante */}
        {open && (
          <div className="absolute bottom-full left-0 mb-2 z-50 animate-fade-in">
            <div className="flex items-center gap-0.5 p-1.5 rounded-xl bg-surface-card border border-surface-border shadow-2xl">
              {REACTION_TYPES.map(type => {
                const cfg  = REACTION_CONFIG[type]
                const Icon = cfg.icon
                const isMe = localMine === type
                return (
                  <button
                    key={type}
                    onClick={() => handleReact(type)}
                    title={isMe ? `Quitar "${cfg.label}"` : cfg.label}
                    className={cn(
                      'flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-150',
                      'hover:scale-125 hover:-translate-y-1',
                      isMe
                        ? `${cfg.activeColor} bg-current/15 scale-110`
                        : `text-text-muted ${cfg.hoverBg} hover:${cfg.activeColor}`
                    )}
                  >
                    <Icon className={cn('w-5 h-5', isMe && 'fill-current')} />
                  </button>
                )
              })}
            </div>
            {/* Puntito indicador */}
            <div className="w-2 h-2 bg-surface-card border-r border-b border-surface-border rotate-45 mx-3 -mt-1" />
          </div>
        )}
      </div>
    </div>
  )
}
