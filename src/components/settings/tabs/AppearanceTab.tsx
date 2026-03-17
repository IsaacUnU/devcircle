'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { Palette, Globe2, Monitor, Sun, Moon, Columns, Square, Layout } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import toast from 'react-hot-toast'

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
  const { sidebarStyle, setSidebarStyle, language, setLanguage } = useUIStore()
  const { dict } = useTranslation()
  const t = dict.settings.appearance

  const THEMES = [
    { id: 'light', label: t.themes.light, icon: Sun, preview: 'bg-white' },
    { id: 'dark', label: t.themes.dark, icon: Moon, preview: 'bg-slate-900' },
    { id: 'system', label: t.themes.system, icon: Monitor, preview: 'bg-gradient-to-br from-white to-slate-900' },
  ]

  const SIDEBAR_STYLES = [
    { id: 'full', label: t.sidebarStyles.full, icon: Columns },
    { id: 'compact', label: t.sidebarStyles.compact, icon: Square },
    { id: 'floating', label: t.sidebarStyles.floating, icon: Layout },
  ]

  return (
    <div className="space-y-10 animate-fade-in max-w-xl pb-10">
      {/* Tema */}
      <section>
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
            <Palette className="w-4 h-4" /> {t.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
          {THEMES.map(t_theme => (
            <button
              key={t_theme.id}
              onClick={() => {
                setTheme(t_theme.id)
                toast.success(`${t.toasts.themeChanged}: ${t_theme.label}`)
              }}
              className={cn(
                'group flex items-center gap-2 p-2 rounded-xl border transition-all duration-200 text-left',
                theme === t_theme.id
                  ? 'border-brand-500 bg-brand-500/5'
                  : 'border-surface-border bg-surface-card/30 hover:border-brand-500/30'
              )}
            >
              <div className={cn(
                'w-10 h-10 rounded-lg border shadow-sm shrink-0 transition-transform duration-300 group-hover:scale-105',
                t_theme.preview,
                theme === t_theme.id ? 'border-brand-500/40' : 'border-black/5 dark:border-white/5'
              )} />
              <div className="flex flex-col items-start min-w-0 flex-1">
                <span className={cn(
                  'text-sm font-bold',
                  theme === t_theme.id ? 'text-brand-500' : 'text-text-primary'
                )}>
                  {t_theme.label}
                </span>
                {theme === t_theme.id && (
                  <span className="text-[10px] text-brand-500/70 font-medium leading-tight">
                    {t.themes.selected}
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
            <Layout className="w-4 h-4" /> {t.sidebarTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
          {SIDEBAR_STYLES.map(s => (
            <button
              key={s.id}
              onClick={() => {
                setSidebarStyle(s.id as any)
                toast.success(`${t.toasts.styleChanged}: ${s.label}`)
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
                    {t.sidebarStyles.active}
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
            <Globe2 className="w-4 h-4" /> {t.languageTitle}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map(l => (
            <button
              key={l.id}
              onClick={() => {
                setLanguage(l.id)
                toast.success(`${t.toasts.languageChanged} ${l.name}`)
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