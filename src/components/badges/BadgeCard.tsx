import { cn } from '@/lib/utils'
import {
  PenLine, BookOpen, Library, Trophy,
  Users, Star, Flame, Music2,
  Heart, Gem, Rocket,
  CalendarDays, CalendarRange,
  Sprout, Code2,
  LucideIcon,
} from 'lucide-react'

// ─── Definición de badges ────────────────────────────────────────────────────
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'diamond'

export interface BadgeDef {
  slug:        string
  name:        string
  description: string
  icon:        LucideIcon
  tier:        BadgeTier
  category:    'posts' | 'social' | 'reactions' | 'consistency' | 'special'
}

export const BADGE_DEFS: BadgeDef[] = [
  // POSTS
  { slug: 'first_post',    name: 'First Post',    description: 'Publicaste tu primer post',  icon: PenLine,      tier: 'bronze',  category: 'posts'       },
  { slug: 'storyteller',  name: 'Storyteller',   description: '10 posts publicados',          icon: BookOpen,     tier: 'silver',  category: 'posts'       },
  { slug: 'prolific',     name: 'Prolific',      description: '50 posts publicados',          icon: Library,      tier: 'gold',    category: 'posts'       },
  { slug: 'legend',       name: 'Legend',        description: '200 posts publicados',         icon: Trophy,       tier: 'diamond', category: 'posts'       },
  // SOCIAL
  { slug: 'first_fan',    name: 'First Fan',     description: 'Primer seguidor conseguido',  icon: Users,        tier: 'bronze',  category: 'social'      },
  { slug: 'influencer',   name: 'Influencer',    description: '50 seguidores',                icon: Star,         tier: 'silver',  category: 'social'      },
  { slug: 'popular',      name: 'Popular Dev',   description: '200 seguidores',               icon: Flame,        tier: 'gold',    category: 'social'      },
  { slug: 'rockstar',     name: 'Rockstar',      description: '1 000 seguidores',             icon: Music2,       tier: 'diamond', category: 'social'      },
  // REACTIONS
  { slug: 'liked',        name: 'Liked',         description: '10 reacciones recibidas',     icon: Heart,        tier: 'bronze',  category: 'reactions'   },
  { slug: 'beloved',      name: 'Beloved',       description: '100 reacciones recibidas',    icon: Gem,          tier: 'silver',  category: 'reactions'   },
  { slug: 'viral',        name: 'Viral',         description: '500 reacciones recibidas',    icon: Rocket,       tier: 'gold',    category: 'reactions'   },
  // CONSISTENCY
  { slug: 'week_streak',  name: 'Week Streak',   description: '7 días activo seguidos',      icon: CalendarDays, tier: 'bronze',  category: 'consistency' },
  { slug: 'month_streak', name: 'Month Streak',  description: '30 días activo seguidos',     icon: CalendarRange,tier: 'gold',    category: 'consistency' },
  // SPECIAL
  { slug: 'early_adopter',name: 'Early Adopter', description: 'Miembro fundador de Devora',  icon: Sprout,       tier: 'diamond', category: 'special'     },
  { slug: 'code_sharer',  name: 'Code Sharer',   description: '5 snippets de código',        icon: Code2,        tier: 'silver',  category: 'special'     },
]

// ─── Estilos por tier ─────────────────────────────────────────────────────────
const TIER_STYLES: Record<BadgeTier, {
  bg: string; border: string; iconColor: string; label: string; glow: string
}> = {
  bronze:  { bg: 'bg-amber-950/40',  border: 'border-amber-700/40',  iconColor: 'text-amber-500',  label: 'Bronce',   glow: 'shadow-amber-900/20'  },
  silver:  { bg: 'bg-slate-800/40',  border: 'border-slate-500/40',  iconColor: 'text-slate-300',  label: 'Plata',    glow: 'shadow-slate-700/20'  },
  gold:    { bg: 'bg-yellow-950/40', border: 'border-yellow-600/40', iconColor: 'text-yellow-400', label: 'Oro',      glow: 'shadow-yellow-900/30' },
  diamond: { bg: 'bg-cyan-950/40',   border: 'border-cyan-500/40',   iconColor: 'text-cyan-400',   label: 'Diamante', glow: 'shadow-cyan-900/40'   },
}

// ─── BadgeIcon (versión compacta para listas) ─────────────────────────────────
export function BadgeIcon({
  badge,
  earnedAt,
  size = 'md',
}: {
  badge:     BadgeDef
  earnedAt?: Date
  size?:     'sm' | 'md' | 'lg'
}) {
  const s      = TIER_STYLES[badge.tier]
  const Icon   = badge.icon
  const sizes  = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-12 h-12' }
  const iSizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' }

  return (
    <div
      className={cn(
        'group relative flex items-center justify-center rounded-xl border transition-all duration-200 cursor-default',
        'hover:scale-110 hover:shadow-lg',
        sizes[size], s.bg, s.border, s.glow
      )}
      title={`${badge.name} — ${badge.description}`}
    >
      <Icon className={cn(iSizes[size], s.iconColor)} />

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 hidden group-hover:block pointer-events-none animate-fade-in">
        <div className="bg-surface-card border border-surface-border rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-xl">
          <p className={cn('font-semibold', s.iconColor)}>{badge.name}</p>
          <p className="text-text-muted mt-0.5">{badge.description}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full border', s.border, s.iconColor, s.bg)}>
              {s.label}
            </span>
          </div>
        </div>
        {/* Arrow */}
        <div className="w-2 h-2 bg-surface-card border-r border-b border-surface-border rotate-45 mx-auto -mt-1" />
      </div>
    </div>
  )
}

// ─── BadgeCard (para la página de perfil / listado completo) ──────────────────
export function BadgeCard({ badge, earnedAt }: { badge: BadgeDef; earnedAt?: Date }) {
  const s    = TIER_STYLES[badge.tier]
  const Icon = badge.icon

  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-xl border transition-all duration-200',
      'hover:scale-[1.02] hover:shadow-lg',
      s.bg, s.border, s.glow
    )}>
      <div className={cn(
        'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border',
        s.bg, s.border
      )}>
        <Icon className={cn('w-5 h-5', s.iconColor)} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={cn('font-semibold text-sm', s.iconColor)}>{badge.name}</p>
          <span className={cn(
            'text-[10px] px-1.5 py-0.5 rounded-full border font-medium',
            s.border, s.iconColor, s.bg
          )}>
            {s.label}
          </span>
        </div>
        <p className="text-text-muted text-xs mt-0.5 truncate">{badge.description}</p>
      </div>
    </div>
  )
}

// ─── BadgeRow (fila compacta para el perfil header) ───────────────────────────
export function BadgeRow({
  earnedSlugs,
  max = 8,
}: {
  earnedSlugs: string[]
  max?:        number
}) {
  if (!earnedSlugs.length) return null

  const earned    = BADGE_DEFS.filter(b => earnedSlugs.includes(b.slug))
  const displayed = earned.slice(0, max)
  const remaining = earned.length - max

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {displayed.map(badge => (
        <BadgeIcon key={badge.slug} badge={badge} size="sm" />
      ))}
      {remaining > 0 && (
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-surface-hover border border-surface-border text-xs text-text-muted font-medium">
          +{remaining}
        </div>
      )}
    </div>
  )
}

// ─── BadgeGrid (sección completa del perfil) ──────────────────────────────────
// compact=true → iconos pequeños agrupados (para columna lateral)
// compact=false → tarjetas completas (si se usara en página propia)
export function BadgeGrid({
  earnedSlugs,
  compact = false,
}: {
  earnedSlugs:  string[]
  compact?:     boolean
}) {
  const earned = new Set(earnedSlugs)

  const categories: Record<string, BadgeDef[]> = {}
  for (const badge of BADGE_DEFS) {
    if (!categories[badge.category]) categories[badge.category] = []
    categories[badge.category].push(badge)
  }

  const catLabels: Record<string, string> = {
    posts:       'Publicaciones',
    social:      'Social',
    reactions:   'Reacciones',
    consistency: 'Consistencia',
    special:     'Especial',
  }

  // ── Modo compacto: fila de iconos por categoría ───────────────────────────
  if (compact) {
    return (
      <div className="space-y-3">
        {Object.entries(categories).map(([cat, badges]) => {
          const earnedInCat = badges.filter(b => earned.has(b.slug))
          const totalInCat  = badges.length
          return (
            <div key={cat}>
              {/* Cabecera de categoría */}
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  {catLabels[cat]}
                </p>
                <span className="text-[10px] text-text-muted">
                  {earnedInCat.length}/{totalInCat}
                </span>
              </div>
              {/* Iconos en fila */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {badges.map(badge => {
                  const isEarned = earned.has(badge.slug)
                  const s = TIER_STYLES[badge.tier]
                  const Icon = badge.icon
                  return (
                    <div
                      key={badge.slug}
                      className={cn(
                        'group relative flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-200 cursor-default',
                        'hover:scale-110',
                        isEarned
                          ? cn(s.bg, s.border)
                          : 'bg-surface-hover border-surface-border opacity-25 grayscale',
                      )}
                      title={`${badge.name} — ${badge.description}`}
                    >
                      <Icon className={cn('w-4 h-4', isEarned ? s.iconColor : 'text-text-muted')} />

                      {/* Tooltip al hover */}
                      {isEarned && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 hidden group-hover:block pointer-events-none">
                          <div className="bg-surface-card border border-surface-border rounded-lg px-2.5 py-1.5 text-xs whitespace-nowrap shadow-xl">
                            <p className={cn('font-semibold text-[11px]', s.iconColor)}>{badge.name}</p>
                            <p className="text-text-muted text-[10px] mt-0.5">{badge.description}</p>
                            <span className={cn('text-[9px] font-medium px-1 py-0.5 rounded-full border mt-1 inline-block', s.border, s.iconColor, s.bg)}>
                              {s.label}
                            </span>
                          </div>
                          <div className="w-2 h-2 bg-surface-card border-r border-b border-surface-border rotate-45 mx-auto -mt-1" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // ── Modo completo: tarjetas ────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {Object.entries(categories).map(([cat, badges]) => (
        <div key={cat}>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            {catLabels[cat]}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {badges.map(badge => {
              const isEarned = earned.has(badge.slug)
              return (
                <div key={badge.slug} className={cn(!isEarned && 'opacity-30 grayscale')}>
                  <BadgeCard badge={badge} />
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
