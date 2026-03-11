'use client'

import { useTransition, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateProfileSchema, UpdateProfile } from '@/lib/validations'
import { updateProfile } from '@/lib/actions/users'
import { updateAvatar } from '@/lib/actions/settings'
import toast from 'react-hot-toast'
import { cn, getAvatarUrl } from '@/lib/utils'
import { Save, User, MapPin, Globe, AlignLeft, Pin, Camera, Link2 } from 'lucide-react'

const COUNTRIES = [
  'España','México','Argentina','Colombia','Chile','Perú','Venezuela',
  'Estados Unidos','Reino Unido','Alemania','Francia','Portugal','Brasil',
  'Italia','Países Bajos','Suecia','Polonia','Ucrania','India','Canadá',
  'Australia','Japón','Corea del Sur','Otro',
]

function parseLocation(location?: string | null) {
  if (!location) return { city: '', country: '' }
  const parts = location.split(',')
  return parts.length >= 2
    ? { city: parts[0].trim(), country: parts.slice(1).join(',').trim() }
    : { city: location.trim(), country: '' }
}

interface ProfileTabProps {
  user: { id: string; name?: string|null; bio?: string|null; website?: string|null; location?: string|null; image?: string|null; username: string }
}

export function ProfileTab({ user }: ProfileTabProps) {
  const [isPending, startTransition] = useTransition()
  const [avatarUrl, setAvatarUrl]    = useState(user.image ?? '')
  const [avatarInput, setAvatarInput] = useState('')
  const [savingAvatar, setSavingAvatar] = useState(false)
  const { city, country } = parseLocation(user.location)

  const { register, handleSubmit, formState: { errors } } = useForm<UpdateProfile>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: user.name ?? '', bio: user.bio ?? '', website: user.website ?? '', location: city, country },
  })

  const onSubmit = (data: UpdateProfile) => {
    startTransition(async () => {
      try { await updateProfile(data); toast.success('Perfil actualizado') }
      catch (e: any) { toast.error(e.message) }
    })
  }

  const handleAvatarSave = async () => {
    if (!avatarInput.trim()) return
    setSavingAvatar(true)
    try {
      await updateAvatar(avatarInput.trim())
      setAvatarUrl(avatarInput.trim())
      setAvatarInput('')
      toast.success('Foto de perfil actualizada')
    } catch (e: any) { toast.error(e.message) }
    finally { setSavingAvatar(false) }
  }

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <section className="card p-6">
        <h2 className="text-sm font-bold text-text-primary mb-5 flex items-center gap-2">
          <Camera className="w-4 h-4 text-brand-400" /> Foto de perfil
        </h2>
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <img src={avatarUrl || getAvatarUrl(user.username)} alt="" className="w-20 h-20 rounded-full border-2 border-brand-500/30 object-cover" />
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-xs text-text-muted">Pega la URL de tu foto (GitHub, Gravatar, etc.)</p>
            <p className="text-[11px] text-text-muted/60">📌 Subida desde dispositivo disponible próximamente con Supabase Storage</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  value={avatarInput}
                  onChange={e => setAvatarInput(e.target.value)}
                  placeholder="https://avatars.githubusercontent.com/..."
                  className="input pl-9 text-sm"
                />
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              </div>
              <button onClick={handleAvatarSave} disabled={savingAvatar || !avatarInput}
                className="btn-primary px-4 text-sm disabled:opacity-40">
                {savingAvatar ? '...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Datos del perfil */}
      <section className="card p-6">
        <h2 className="text-sm font-bold text-text-primary mb-5 flex items-center gap-2">
          <User className="w-4 h-4 text-brand-400" /> Información pública
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">Nombre completo</label>
            <div className="relative">
              <input {...register('name')} className={cn('input pl-10', errors.name && 'border-red-500/50')} placeholder="Tu nombre" />
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            </div>
            {errors.name && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">Bio</label>
            <div className="relative">
              <textarea {...register('bio')} className="input pl-10 h-24 resize-none text-sm py-3" placeholder="Full-stack dev. Amante de React..." />
              <AlignLeft className="absolute left-3.5 top-4 w-4 h-4 text-text-muted" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">Ciudad</label>
              <div className="relative">
                <input {...register('location')} className="input pl-10 text-sm" placeholder="Alicante" />
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">País</label>
              <div className="relative">
                <select {...register('country')} className="input pl-10 text-sm bg-surface appearance-none">
                  <option value="">Seleccionar...</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <Pin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">Website / Portfolio</label>
            <div className="relative">
              <input {...register('website')} className={cn('input pl-10 text-sm', errors.website && 'border-red-500/50')} placeholder="https://tuportfolio.com" />
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            </div>
          </div>

          <div className="pt-4 border-t border-surface-border flex justify-end">
            <button type="submit" disabled={isPending} className="btn-primary flex items-center gap-2 px-8">
              <Save className="w-4 h-4" />
              {isPending ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
