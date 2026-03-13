'use client'

import { useState, useTransition } from 'react'
import {
  Lock, Eye, EyeOff, MessageSquare, MessageSquareOff,
  Users, UserX, Shield, ChevronDown, CheckCircle2, Clock
} from 'lucide-react'
import { updatePrivacySettings, respondFollowRequest } from '@/lib/actions/privacy'
import type { PrivacySettings } from '@/lib/privacy'
import { getAvatarUrl } from '@/lib/utils'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

type Visibility = 'everyone' | 'followers' | 'nobody'

interface PrivacyTabProps {
  initialSettings: PrivacySettings
  pendingRequests: {
    id: string
    sender: { id: string; username: string; name: string | null; image: string | null; bio: string | null }
    createdAt: Date
  }[]
}

// ── Select reutilizable ───────────────────────────────────────────────────────
const VISIBILITY_OPTIONS: { value: Visibility; label: string; icon: any }[] = [
  { value: 'everyone', label: 'Todo el mundo', icon: Eye },
  { value: 'followers', label: 'Solo mis seguidores', icon: Users },
  { value: 'nobody', label: 'Solo yo', icon: EyeOff },
]

function VisibilitySelect({
  value, onChange, label, description, icon: Icon,
}: {
  value: Visibility
  onChange: (v: Visibility) => void
  label: string
  description: string
  icon: any
}) {
  const current = VISIBILITY_OPTIONS.find(o => o.value === value)!

  return (
    <div className="flex items-center justify-between py-4 border-b border-surface-border last:border-0">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center mt-0.5 shrink-0">
          <Icon className="w-4 h-4 text-brand-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary">{label}</p>
          <p className="text-xs text-text-muted mt-0.5">{description}</p>
        </div>
      </div>
      <div className="relative shrink-0 ml-4">
        <select
          value={value}
          onChange={e => onChange(e.target.value as Visibility)}
          className="appearance-none bg-surface-2 border border-surface-border text-text-secondary text-xs font-medium px-3 py-2 pr-7 rounded-lg cursor-pointer hover:border-brand-500/50 transition-colors focus:outline-none focus:border-brand-500"
        >
          {VISIBILITY_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted pointer-events-none" />
      </div>
    </div>
  )
}

export function PrivacyTab({ initialSettings, pendingRequests }: PrivacyTabProps) {
  const [settings, setSettings] = useState<PrivacySettings>(initialSettings)
  const [isPending, startTransition] = useTransition()
  const [respondingId, setRespondingId] = useState<string | null>(null)
  const [localRequests, setLocalRequests] = useState(pendingRequests)

  function set<K extends keyof PrivacySettings>(key: K, value: PrivacySettings[K]) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await updatePrivacySettings(settings)
        toast.success('Ajustes de privacidad guardados')
      } catch (err: any) {
        toast.error(err.message ?? 'Error al guardar')
      }
    })
  }

  async function handleRespond(requestId: string, action: 'accept' | 'reject') {
    setRespondingId(requestId)
    try {
      await respondFollowRequest(requestId, action)
      setLocalRequests(prev => prev.filter(r => r.id !== requestId))
      toast.success(action === 'accept' ? 'Solicitud aceptada' : 'Solicitud rechazada')
    } catch (err: any) {
      toast.error(err.message ?? 'Error')
    } finally {
      setRespondingId(null)
    }
  }

  return (
    <div className="space-y-6">

      {/* ── Cuenta privada ────────────────────────────────────────── */}
      <div className="card p-6">
        <h2 className="text-sm font-bold text-text-primary mb-1 flex items-center gap-2">
          <Lock className="w-4 h-4 text-brand-400" />
          Cuenta privada
        </h2>
        <p className="text-xs text-text-muted mb-5">
          Con la cuenta privada, las personas tendrán que enviarte una solicitud para seguirte. Tú la aceptas o rechazas.
        </p>

        <label className="flex items-center justify-between cursor-pointer group">
          <div>
            <p className="text-sm font-semibold text-text-primary group-hover:text-brand-400 transition-colors">
              Activar perfil privado
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              {settings.isPrivate
                ? 'Tu perfil es privado — se requiere aprobación para seguirte'
                : 'Tu perfil es público — cualquiera puede seguirte'}
            </p>
          </div>
          {/* Toggle switch */}
          <button
            type="button"
            onClick={() => set('isPrivate', !settings.isPrivate)}
            className={cn(
              'relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none shrink-0',
              settings.isPrivate ? 'bg-brand-500' : 'bg-surface-2 border border-surface-border'
            )}
          >
            <span className={cn(
              'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300',
              settings.isPrivate ? 'translate-x-5' : 'translate-x-0'
            )} />
          </button>
        </label>
      </div>

      {/* ── Visibilidad de listas ─────────────────────────────────── */}
      <div className="card p-6">
        <h2 className="text-sm font-bold text-text-primary mb-1 flex items-center gap-2">
          <Eye className="w-4 h-4 text-brand-400" />
          Visibilidad de listas
        </h2>
        <p className="text-xs text-text-muted mb-4">
          Elige quién puede ver tus listas de seguidores y seguidos.
        </p>
        <VisibilitySelect
          value={settings.showFollowers}
          onChange={v => set('showFollowers', v)}
          label="¿Quién puede ver tus seguidores?"
          description="La lista de personas que te siguen"
          icon={Users}
        />
        <VisibilitySelect
          value={settings.showFollowing}
          onChange={v => set('showFollowing', v)}
          label="¿Quién puede ver a quién sigues?"
          description="La lista de personas a las que sigues"
          icon={Eye}
        />
      </div>

      {/* ── Interacciones ─────────────────────────────────────────── */}
      <div className="card p-6">
        <h2 className="text-sm font-bold text-text-primary mb-1 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-brand-400" />
          Interacciones
        </h2>
        <p className="text-xs text-text-muted mb-4">
          Controla quién puede interactuar contigo.
        </p>
        <VisibilitySelect
          value={settings.whoCanMessage}
          onChange={v => set('whoCanMessage', v)}
          label="¿Quién puede enviarte mensajes?"
          description="Mensajes directos en tu bandeja"
          icon={MessageSquare}
        />
        <VisibilitySelect
          value={settings.whoCanComment}
          onChange={v => set('whoCanComment', v)}
          label="¿Quién puede comentar tus posts?"
          description="Comentarios en tus publicaciones"
          icon={MessageSquareOff}
        />
      </div>

      {/* ── Solicitudes de follow pendientes ─────────────────────── */}
      {settings.isPrivate && (
        <div className="card p-6">
          <h2 className="text-sm font-bold text-text-primary mb-1 flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-400" />
            Solicitudes de seguimiento
            {localRequests.length > 0 && (
              <span className="ml-1 bg-brand-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                {localRequests.length}
              </span>
            )}
          </h2>
          <p className="text-xs text-text-muted mb-4">
            Personas que han solicitado seguirte y están esperando tu respuesta.
          </p>

          {localRequests.length === 0 ? (
            <div className="py-8 text-center text-text-muted text-sm">
              <UserX className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No tienes solicitudes pendientes
            </div>
          ) : (
            <ul className="divide-y divide-surface-border">
              {localRequests.map(req => {
                const avatar = req.sender.image ?? getAvatarUrl(req.sender.username)
                const isResponding = respondingId === req.id
                return (
                  <li key={req.id} className="flex items-center gap-3 py-3">
                    <img src={avatar} alt="" className="w-10 h-10 avatar shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {req.sender.name ?? req.sender.username}
                      </p>
                      <p className="text-xs text-text-muted">@{req.sender.username}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleRespond(req.id, 'accept')}
                        disabled={isResponding}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-brand-500/10 border border-brand-500/30 text-brand-400 hover:bg-brand-500/20 transition-colors font-medium disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Aceptar
                      </button>
                      <button
                        onClick={() => handleRespond(req.id, 'reject')}
                        disabled={isResponding}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-surface-2 border border-surface-border text-text-muted hover:border-red-500/50 hover:text-red-400 transition-colors font-medium disabled:opacity-50"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        Rechazar
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}

      {/* ── Botón guardar ─────────────────────────────────────────── */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="btn-primary flex items-center gap-2 px-8"
        >
          <Shield className="w-4 h-4" />
          {isPending ? 'Guardando...' : 'Guardar ajustes de privacidad'}
        </button>
      </div>

    </div>
  )
}
