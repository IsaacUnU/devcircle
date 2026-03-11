'use client'

import { useState, useTransition } from 'react'
import { Bell, Heart, MessageCircle, UserPlus, AtSign, Zap, Save } from 'lucide-react'
import { updateNotificationPrefs } from '@/lib/actions/settings'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface NotifPref { key: string; label: string; description: string; icon: any; defaultOn: boolean }

const NOTIF_PREFS: NotifPref[] = [
  { key: 'likes',     label: 'Me gusta',     description: 'Cuando alguien le da like a tu post',      icon: Heart,          defaultOn: true },
  { key: 'comments',  label: 'Comentarios',  description: 'Cuando alguien comenta tu post',             icon: MessageCircle,  defaultOn: true },
  { key: 'follows',   label: 'Nuevos seguidores', description: 'Cuando alguien empieza a seguirte',    icon: UserPlus,       defaultOn: true },
  { key: 'mentions',  label: 'Menciones',    description: 'Cuando te mencionan con @usuario',           icon: AtSign,         defaultOn: true },
  { key: 'replies',   label: 'Respuestas',   description: 'Cuando alguien responde a tu comentario',   icon: MessageCircle,  defaultOn: true },
  { key: 'reputation',label: 'Reputación',   description: 'Cuando ganas o pierdes puntos de reputación', icon: Zap,           defaultOn: false },
]

interface NotificationsTabProps {
  initialPrefs: Record<string, boolean>
}

export function NotificationsTab({ initialPrefs }: NotificationsTabProps) {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() => {
    const defaults: Record<string, boolean> = {}
    NOTIF_PREFS.forEach(p => { defaults[p.key] = initialPrefs[p.key] ?? p.defaultOn })
    return defaults
  })
  const [isPending, startTransition] = useTransition()

  const toggle = (key: string) => setPrefs(prev => ({ ...prev, [key]: !prev[key] }))

  const save = () => {
    startTransition(async () => {
      try { await updateNotificationPrefs(prefs); toast.success('Preferencias guardadas') }
      catch (e: any) { toast.error(e.message) }
    })
  }

  return (
    <div className="space-y-6">
      <section className="card p-6">
        <h2 className="text-sm font-bold text-text-primary mb-5 flex items-center gap-2">
          <Bell className="w-4 h-4 text-brand-400" /> Notificaciones
        </h2>
        <div className="space-y-2">
          {NOTIF_PREFS.map(pref => (
            <div key={pref.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-hover transition-colors">
              <div className="flex items-center gap-3">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', prefs[pref.key] ? 'bg-brand-500/15 text-brand-400' : 'bg-surface-hover text-text-muted')}>
                  <pref.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{pref.label}</p>
                  <p className="text-xs text-text-muted">{pref.description}</p>
                </div>
              </div>
              {/* Toggle switch */}
              <button
                onClick={() => toggle(pref.key)}
                className={cn(
                  'relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 shrink-0 focus:outline-none',
                  prefs[pref.key] ? 'bg-brand-500' : 'bg-white/10'
                )}
              >
                <span className={cn(
                  'inline-block w-4 h-4 bg-white rounded-full shadow transition-transform duration-200',
                  prefs[pref.key] ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
          ))}
        </div>
        <div className="pt-5 border-t border-surface-border mt-4 flex justify-end">
          <button onClick={save} disabled={isPending} className="btn-primary flex items-center gap-2 px-8">
            <Save className="w-4 h-4" />
            {isPending ? 'Guardando...' : 'Guardar preferencias'}
          </button>
        </div>
      </section>
    </div>
  )
}
