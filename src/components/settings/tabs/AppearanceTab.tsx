'use client'

import { useState } from 'react'
import { Palette, Globe2, Monitor, Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const THEMES  = [
  { id: 'dark',   label: 'Oscuro',   icon: Moon,    preview: 'bg-zinc-900 border-zinc-700' },
  { id: 'light',  label: 'Claro',    icon: Sun,     preview: 'bg-white border-zinc-200' },
  { id: 'system', label: 'Sistema',  icon: Monitor, preview: 'bg-gradient-to-br from-zinc-900 to-white border-zinc-400' },
]

const LANGUAGES = [
  { id: 'es', label: 'Español' },
  { id: 'en', label: 'English' },
  { id: 'pt', label: 'Português' },
  { id: 'fr', label: 'Français' },
  { id: 'de', label: 'Deutsch' },
]

export function AppearanceTab() {
  const [theme, setTheme]     = useState('dark')
  const [language, setLang]   = useState('es')

  const applyTheme = (id: string) => {
    setTheme(id)
    // Por ahora Devora es dark-only, guardamos la preferencia
    // y mostramos un aviso si eligen claro
    if (id === 'light') {
      toast('El tema claro estará disponible próximamente', { icon: '🎨' })
    } else {
      toast.success('Tema guardado')
    }
  }

  return (
    <div className="space-y-6">
      {/* Tema */}
      <section className="card p-6">
        <h2 className="text-sm font-bold text-text-primary mb-5 flex items-center gap-2">
          <Palette className="w-4 h-4 text-brand-400" /> Tema
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map(t => (
            <button key={t.id} onClick={() => applyTheme(t.id)}
              className={cn('flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all',
                theme === t.id ? 'border-brand-500 bg-brand-500/5' : 'border-white/10 hover:border-white/20'
              )}
            >
              <div className={cn('w-full h-12 rounded-lg border', t.preview)} />
              <div className="flex items-center gap-1.5">
                <t.icon className="w-3.5 h-3.5 text-text-muted" />
                <span className="text-xs font-semibold text-text-primary">{t.label}</span>
              </div>
              {theme === t.id && (
                <span className="text-[10px] font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full">Activo</span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Idioma */}
      <section className="card p-6">
        <h2 className="text-sm font-bold text-text-primary mb-5 flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-brand-400" /> Idioma de la interfaz
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {LANGUAGES.map(l => (
            <button key={l.id} onClick={() => { setLang(l.id); toast(l.id === 'es' ? 'Idioma guardado' : 'Próximamente disponible', { icon: '🌐' }) }}
              className={cn('px-4 py-3 rounded-xl border text-sm font-semibold transition-all',
                language === l.id
                  ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                  : 'border-white/10 text-text-secondary hover:border-white/20 hover:text-text-primary'
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-text-muted mt-4">Más idiomas disponibles próximamente.</p>
      </section>
    </div>
  )
}
