'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { Palette, Globe2, Monitor, Sun, Moon, Columns, Square, Layout } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/lib/store'
import toast from 'react-hot-toast'

const THEMES = [
  { id: 'light', label: 'Claro', icon: Sun, preview: 'bg-white' },
  { id: 'dark', label: 'Oscuro', icon: Moon, preview: 'bg-slate-900' },
  { id: 'system', label: 'Sistema', icon: Monitor, preview: 'bg-gradient-to-br from-white to-slate-900' },
]

const SIDEBAR_STYLES = [
  { id: 'full', label: 'Completa', icon: Columns },
  { id: 'compact', label: 'Compacta', icon: Square },
  { id: 'floating', label: 'Flotante', icon: Layout },
]

const LANGUAGES = [
  { id: 'es', label: 'ESP', name: 'Español' },
  { id: 'en', label: 'ENG', name: 'English' },
  { id: 'pt', label: 'POR', name: 'Português' },
  { id: 'fr', label: 'FRA', name: 'Français' },
  { id: 'de', label: 'DEU', name: 'Deutsch' },
  { id: 'it', label: 'ITA', name: 'Italiano' },
  { id: 'nl', label: 'NLD', name: 'Nederlands' },
  { id: 'pl', label: 'POL', name: 'Polski' },
  { id: 'ru', label: 'RUS', name: 'Русский' },
  { id: 'zh', label: 'ZHO', name: '中文' },
  { id: 'ja', label: 'JPN', name: '日本語' },
  { id: 'ko', label: 'KOR', name: '한국어' },
  { id: 'ar', label: 'ARA', name: 'العربية' },
  { id: 'tr', label: 'TUR', name: 'Türkçe' },
  { id: 'hi', label: 'HIN', name: 'हिन्दी' },
]

export function AppearanceTab() {
  const { theme, setTheme } = useTheme()
  const { sidebarStyle, setSidebarStyle } = useUIStore()
  const [language, setLang] = useState('es')

  return (
    <div className="space-y-10 animate-fade-in max-w-xl pb-10">
      {/* Tema */}
      <section>
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
            <Palette className="w-4 h-4" /> Apariencia
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => {
                setTheme(t.id)
                toast.success(`Tema ${t.label}`)
              }}
              className={cn(
                'group flex items-center gap-2 p-2 rounded-xl border transition-all duration-200 text-left',
                theme === t.id
                  ? 'border-brand-500 bg-brand-500/5'
                  : 'border-surface-border bg-surface-card/30 hover:border-brand-500/30'
              )}
            >
              <div className={cn(
                'w-10 h-10 rounded-lg border shadow-sm shrink-0 transition-transform duration-300 group-hover:scale-105',
                t.preview,
                theme === t.id ? 'border-brand-500/40' : 'border-black/5 dark:border-white/5'
              )} />

              <div className="flex flex-col items-start min-w-0 flex-1">
                <span className={cn(
                  'text-sm font-bold',
                  theme === t.id ? 'text-brand-500' : 'text-text-primary'
                )}>
                  {t.label}
                </span>
                {theme === t.id && (
                  <span className="text-[10px] text-brand-500/70 font-medium leading-tight">
                    Seleccionado
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Sidebar Style */}
      <section>
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
            <Layout className="w-4 h-4" /> Barra Lateral
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
          {SIDEBAR_STYLES.map(s => (
            <button
              key={s.id}
              onClick={() => {
                setSidebarStyle(s.id as any)
                toast.success(`Estilo ${s.label}`)
              }}
              className={cn(
                'group flex items-center gap-2 p-2 rounded-xl border transition-all duration-200 text-left',
                sidebarStyle === s.id
                  ? 'border-brand-500 bg-brand-500/5'
                  : 'border-surface-border bg-surface-card/30 hover:border-brand-500/30'
              )}
            >
              <div className={cn(
                'w-10 h-10 rounded-lg border bg-surface flex items-center justify-center shrink-0 transition-all duration-300 group-hover:bg-brand-500/10',
                sidebarStyle === s.id ? 'border-brand-500/40 text-brand-500' : 'border-black/5 dark:border-white/5 text-text-muted'
              )}>
                <s.icon className="w-5 h-5" />
              </div>

              <div className="flex flex-col items-start min-w-0 flex-1">
                <span className={cn(
                  'text-sm font-bold',
                  sidebarStyle === s.id ? 'text-brand-500' : 'text-text-primary'
                )}>
                  {s.label}
                </span>
                {sidebarStyle === s.id && (
                  <span className="text-[10px] text-brand-500/70 font-medium leading-tight text-brand-500/60">
                    Activo
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Idioma */}
      <section>
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
            <Globe2 className="w-4 h-4" /> Idioma
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map(l => (
            <button
              key={l.id}
              onClick={() => {
                setLang(l.id)
                if (l.id !== 'es') toast.error('Próximamente')
              }}
              className={cn(
                'px-4 py-2 rounded-lg border text-xs font-bold transition-all duration-200',
                language === l.id
                  ? 'border-brand-500 bg-brand-500 text-white shadow-md shadow-brand-500/20'
                  : 'border-surface-border text-text-secondary bg-surface-card/30 hover:border-brand-500/30 hover:text-text-primary'
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}