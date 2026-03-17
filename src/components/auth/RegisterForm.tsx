'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Eye, EyeOff, Loader2, User, Mail, Lock, MapPin, Globe, ArrowRight, ArrowLeft, AlignLeft, CheckCircle2 } from 'lucide-react'
import { registerSchema, type RegisterInput } from '@/lib/validations'
import { register as registerUser } from '@/lib/actions/auth'
import { useTranslation } from '@/lib/i18n'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'


export function RegisterForm() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { dict } = useTranslation()
  const t = (dict as any).settings.auth.register
  const profileT = (dict as any).settings.profile_form

  const { register, handleSubmit, trigger, watch, setValue, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur', // onTouched causaba que el campo username no permitía borrar
  })

  // Validar solo campos del paso 1 antes de avanzar
  async function goToStep2() {
    const valid = await trigger(['username', 'name', 'email', 'password'])
    if (valid) setStep(2)
  }

  async function onSubmit(data: RegisterInput) {
    setLoading(true)
    try {
      await registerUser(data)
      toast.success(t.success)
      router.push('/auth/login')
    } catch (err: any) {
      toast.error(err.message || t.error)
      setStep(1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* ── Indicador de pasos ── */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2].map(s => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all',
              step > s  ? 'bg-brand-500 border-brand-500 text-black' :
              step === s ? 'border-brand-500 text-brand-400' :
                           'border-white/10 text-text-muted'
            )}>
              {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
            </div>
            <span className={cn('text-xs font-medium', step === s ? 'text-text-primary' : 'text-text-muted')}>
              {s === 1 ? t.step1 : t.step2}
            </span>
            {s < 2 && <div className={cn('flex-1 h-px', step > s ? 'bg-brand-500' : 'bg-white/10')} />}
          </div>
        ))}
      </div>

      {/* ════ PASO 1: Datos de cuenta ════ */}
      {step === 1 && (
        <div className="space-y-4">
          {/* Username + Nombre real */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-text-muted uppercase mb-1.5 block ml-1">{t.username_label}</label>
              <div className="relative">
                <input
                  {...register('username')}
                  placeholder={t.username_placeholder}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck="false"
                  onChange={e => {
                    // Normaliza en tiempo real: lowercase, sin espacios, solo chars válidos
                    // Pero NO bloquea — deja que el usuario borre libremente
                    const raw = e.target.value
                    const cleaned = raw.toLowerCase().replace(/[^a-z0-9_]/g, '')
                    setValue('username', cleaned, { shouldValidate: false, shouldDirty: true })
                  }}
                  className={cn('input pl-9', errors.username && 'border-red-500/50')}
                  disabled={loading}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm font-bold">@</span>
              </div>
              {errors.username && <p className="text-[10px] text-red-400 mt-1 ml-1">{errors.username.message}</p>}
            </div>
            <div>
              <label className="text-xs font-bold text-text-muted uppercase mb-1.5 block ml-1">{t.name_label}</label>
              <div className="relative">
                <input {...register('name')} placeholder={t.name_placeholder} className={cn('input pl-9', errors.name && 'border-red-500/50')} disabled={loading} />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              </div>
              {errors.name && <p className="text-[10px] text-red-400 mt-1 ml-1">{errors.name.message}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-bold text-text-muted uppercase mb-1.5 block ml-1">{t.email_label}</label>
            <div className="relative">
              <input {...register('email')} type="email" placeholder={t.email_placeholder} className={cn('input pl-9', errors.email && 'border-red-500/50')} disabled={loading} />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            </div>
            {errors.email && <p className="text-[10px] text-red-400 mt-1 ml-1">{errors.email.message}</p>}
          </div>

          {/* Contraseña */}
          <div>
            <label className="text-xs font-bold text-text-muted uppercase mb-1.5 block ml-1">{t.password_label}</label>
            <div className="relative">
              <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder={t.password_placeholder} className={cn('input pl-9 pr-10', errors.password && 'border-red-500/50')} disabled={loading} />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-[10px] text-red-400 mt-1 ml-1">{errors.password.message}</p>}
          </div>

          <button type="button" onClick={goToStep2} className="btn-primary w-full py-4 font-bold flex items-center justify-center gap-2 mt-2">
            {t.next_button} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ════ PASO 2: Perfil (opcional) ════ */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-xs text-text-muted text-center -mt-1 mb-2">
            {t.optional_note}
          </p>

          {/* Bio */}
          <div>
            <label className="text-xs font-bold text-text-muted uppercase mb-1.5 block ml-1">{t.bio_label}</label>
            <div className="relative">
              <textarea {...register('bio')} placeholder={t.bio_placeholder} className="input pl-9 h-24 resize-none text-sm py-3" disabled={loading} />
              <AlignLeft className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
            </div>
            {errors.bio && <p className="text-[10px] text-red-400 mt-1 ml-1">{errors.bio.message}</p>}
          </div>

          {/* Ciudad + País */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-text-muted uppercase mb-1.5 block ml-1">{t.city_label}</label>
              <div className="relative">
                <input {...register('location')} placeholder={t.city_placeholder} className="input pl-9 text-sm" disabled={loading} />
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-text-muted uppercase mb-1.5 block ml-1">{t.country_label}</label>
              <select {...register('country')} className="input text-sm bg-surface" disabled={loading}>
                <option value="">{t.select_country}</option>
                {(profileT.countries_list || []).map((c: string) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="text-xs font-bold text-text-muted uppercase mb-1.5 block ml-1">{t.website_label}</label>
            <div className="relative">
              <input {...register('website')} placeholder={t.website_placeholder} className={cn('input pl-9 text-sm', errors.website && 'border-red-500/50')} disabled={loading} />
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            </div>
            {errors.website && <p className="text-[10px] text-red-400 mt-1 ml-1">{errors.website.message}</p>}
          </div>

          {/* Botones */}
          <div className="flex gap-3 mt-2">
            <button type="button" onClick={() => setStep(1)} className="btn-secondary flex items-center gap-2 px-5 py-4 font-bold">
              <ArrowLeft className="w-4 h-4" /> {t.back_button}
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-4 font-bold flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> {t.creating}</> : t.create_button}
            </button>
          </div>
        </div>
      )}

    </form>
  )
}
