'use client'

import { useTransition, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateProfileSchema, UpdateProfile } from '@/lib/validations'
import { updateProfile } from '@/lib/actions/users'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { Save, User, MapPin, Globe, AlignLeft, Pin } from 'lucide-react'

const COUNTRIES = [
  'España', 'México', 'Argentina', 'Colombia', 'Chile', 'Perú', 'Venezuela',
  'Estados Unidos', 'Reino Unido', 'Alemania', 'Francia', 'Portugal', 'Brasil',
  'Italia', 'Países Bajos', 'Suecia', 'Polonia', 'Ucrania', 'India', 'Canadá',
  'Australia', 'Japón', 'Corea del Sur', 'Otro',
]

// Separar "Alicante, España" → { city: "Alicante", country: "España" }
function parseLocation(location?: string | null) {
  if (!location) return { city: '', country: '' }
  const parts = location.split(',')
  if (parts.length >= 2) {
    return { city: parts[0].trim(), country: parts.slice(1).join(',').trim() }
  }
  return { city: location.trim(), country: '' }
}

interface SettingsFormProps {
  user: {
    name?: string | null
    bio?: string | null
    website?: string | null
    location?: string | null
  }
}

export function SettingsForm({ user }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition()
  const { city, country } = parseLocation(user.location)

  const { register, handleSubmit, formState: { errors } } = useForm<UpdateProfile>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name:     user.name     ?? '',
      bio:      user.bio      ?? '',
      website:  user.website  ?? '',
      location: city,
      country:  country,
    },
  })

  const onSubmit = (data: UpdateProfile) => {
    startTransition(async () => {
      try {
        await updateProfile(data)
        toast.success('Perfil actualizado correctamente')
      } catch (err: any) {
        toast.error(err.message ?? 'Error al actualizar perfil')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="card p-6 border-brand-500/10">
        <h2 className="text-sm font-bold text-text-primary mb-6 flex items-center gap-2">
          <User className="w-4 h-4 text-brand-400" />
          Información del Perfil
        </h2>

        <div className="space-y-5">

          {/* Nombre */}
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">Nombre completo</label>
            <div className="relative">
              <input {...register('name')} className={cn('input pl-10', errors.name && 'border-red-500/50')} placeholder="Tu nombre" />
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            </div>
            {errors.name && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.name.message}</p>}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">
              Bio <span className="normal-case text-text-muted font-normal">(visible en tu perfil)</span>
            </label>
            <div className="relative">
              <textarea {...register('bio')} className="input pl-10 h-28 resize-none text-sm py-3" placeholder="Cuéntanos sobre ti, qué tecnologías usas, en qué trabajas..." />
              <AlignLeft className="absolute left-3.5 top-4 w-4 h-4 text-text-muted" />
            </div>
            {errors.bio && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.bio.message}</p>}
          </div>

          {/* Ciudad + País */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <option value="">Seleccionar país...</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <Pin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">
              Sitio web / Portfolio <span className="normal-case text-text-muted font-normal">(opcional)</span>
            </label>
            <div className="relative">
              <input {...register('website')} className={cn('input pl-10 text-sm', errors.website && 'border-red-500/50')} placeholder="https://tuportfolio.com" />
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            </div>
            {errors.website && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.website.message}</p>}
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-surface-border flex justify-end">
          <button type="submit" disabled={isPending} className="btn-primary flex items-center gap-2 px-8">
            <Save className="w-4 h-4" />
            {isPending ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </section>
    </form>
  )
}
