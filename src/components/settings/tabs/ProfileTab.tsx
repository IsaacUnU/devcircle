'use client'

import { useTransition, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateProfileSchema, UpdateProfile } from '@/lib/validations'
import { updateProfile } from '@/lib/actions/users'
import { updateAvatar } from '@/lib/actions/settings'
import { uploadFile, AVATARS_BUCKET } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { cn, getAvatarUrl } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'
import { Save, User, MapPin, Globe, AlignLeft, Pin, Camera, Upload, Loader2, Link2, X } from 'lucide-react'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

function parseLocation(location?: string | null) {
  if (!location) return { city: '', country: '' }
  const parts = location.split(',')
  return parts.length >= 2
    ? { city: parts[0].trim(), country: parts.slice(1).join(',').trim() }
    : { city: location.trim(), country: '' }
}

interface ProfileTabProps {
  user: {
    id: string
    name?: string | null
    bio?: string | null
    website?: string | null
    location?: string | null
    image?: string | null
    username: string
  }
}

export function ProfileTab({ user }: ProfileTabProps) {
  const [isPending, startTransition] = useTransition()
  const [avatarUrl, setAvatarUrl]       = useState(user.image ?? '')
  const [avatarInput, setAvatarInput]   = useState('')
  const [uploadMode, setUploadMode]     = useState<'file' | 'url'>('file')
  const [uploading, setUploading]       = useState(false)
  const [preview, setPreview]           = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { dict } = useTranslation()
  const t = (dict as any).settings.profile_form
  const { city, country } = parseLocation(user.location)

  const { register, handleSubmit, formState: { errors } } = useForm<UpdateProfile>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name:     user.name     ?? '',
      bio:      user.bio      ?? '',
      website:  user.website  ?? '',
      location: city,
      country,
    },
  })

  const onSubmit = (data: UpdateProfile) => {
    startTransition(async () => {
      try {
        await updateProfile(data)
        toast.success(t.toasts.updated)
      } catch (e: any) {
        toast.error(e.message ?? t.toasts.error)
      }
    })
  }

  // ── Seleccionar archivo local ──────────────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(t.toasts.invalid_format)
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(t.toasts.size_error)
      return
    }

    setSelectedFile(file)
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
  }

  const clearFile = () => {
    setSelectedFile(null)
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Subir a Supabase Storage ───────────────────────────────────────────────
  const handleFileUpload = async () => {
    if (!selectedFile) return
    setUploading(true)
    try {
      const ext  = selectedFile.name.split('.').pop() ?? 'jpg'
      const path = `${user.id}/avatar.${ext}`
      const publicUrl = await uploadFile(AVATARS_BUCKET, path, selectedFile)
      // Añadir cache-buster para que el navegador no sirva la imagen antigua
      const freshUrl = `${publicUrl}?t=${Date.now()}`
      await updateAvatar(freshUrl)
      setAvatarUrl(freshUrl)
      clearFile()
      toast.success(t.toasts.upload_success)
    } catch (e: any) {
      toast.error(e.message ?? t.toasts.upload_error)
    } finally {
      setUploading(false)
    }
  }

  // ── Guardar URL externa ────────────────────────────────────────────────────
  const handleUrlSave = async () => {
    const trimmed = avatarInput.trim()
    if (!trimmed) return
    if (!trimmed.startsWith('http')) {
      toast.error(t.toasts.invalid_url)
      return
    }
    setUploading(true)
    try {
      await updateAvatar(trimmed)
      setAvatarUrl(trimmed)
      setAvatarInput('')
      toast.success(t.toasts.upload_success)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setUploading(false)
    }
  }

  const currentAvatar = preview ?? (avatarUrl || getAvatarUrl(user.username))

  return (
    <div className="space-y-6">

      {/* ── Sección avatar ───────────────────────────────────────────────── */}
      <section className="card p-6">
        <h2 className="text-sm font-bold text-text-primary mb-5 flex items-center gap-2">
          <Camera className="w-4 h-4 text-brand-400" />
          {t.avatar_title}
        </h2>

        {/* Preview del avatar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-5">
          <div className="relative shrink-0">
            <img
              src={currentAvatar}
              alt={t.avatar_title || 'Avatar'}
              className="w-20 h-20 rounded-full border-2 border-brand-500/30 object-cover shadow-lg"
              onError={e => { (e.target as HTMLImageElement).src = getAvatarUrl(user.username) }}
            />
            {preview && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
                <span className="text-[9px] text-white font-bold">{t.new_tag || 'NEW'}</span>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">@{user.username}</p>
            <p className="text-xs text-text-muted mt-0.5">{t.upload_rules}</p>
          </div>
        </div>

        {/* Toggle modo subida */}
        <div className="flex gap-1 p-1 bg-surface-hover rounded-xl mb-4 w-fit">
          <button
            type="button"
            onClick={() => { setUploadMode('file'); clearFile() }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              uploadMode === 'file'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            )}
          >
            <Upload className="w-3.5 h-3.5" />
            {t.upload_file}
          </button>
          <button
            type="button"
            onClick={() => { setUploadMode('url'); clearFile() }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              uploadMode === 'url'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            )}
          >
            <Link2 className="w-3.5 h-3.5" />
            {t.external_url}
          </button>
        </div>

        {/* Modo: subida de archivo */}
        {uploadMode === 'file' && (
          <div className="space-y-3">
            {!selectedFile ? (
              /* Drop zone */
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-surface-border hover:border-brand-500/50 rounded-xl p-6 text-center transition-colors group"
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-text-muted group-hover:text-brand-400 transition-colors" />
                <p className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                  {t.click_to_upload}
                </p>
                <p className="text-xs text-text-muted mt-1">{t.upload_rules}</p>
              </button>
            ) : (
              /* Archivo seleccionado — preview + confirmar */
              <div className="flex items-center gap-3 p-3 bg-surface-hover rounded-xl border border-brand-500/20">
                <img src={preview!} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{selectedFile.name}</p>
                  <p className="text-xs text-text-muted">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearFile}
                  className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFileSelect}
            />

            {selectedFile && (
              <button
                type="button"
                onClick={handleFileUpload}
                disabled={uploading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {uploading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> {t.uploading_image}</>
                  : <><Upload className="w-4 h-4" /> {t.upload_button}</>
                }
              </button>
            )}
          </div>
        )}

        {/* Modo: URL externa */}
        {uploadMode === 'url' && (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                value={avatarInput}
                onChange={e => setAvatarInput(e.target.value)}
                placeholder={t.url_placeholder}
                className="input pl-9 text-sm"
              />
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            </div>
            <button
              type="button"
              onClick={handleUrlSave}
              disabled={uploading || !avatarInput.trim()}
              className="btn-primary px-4 text-sm disabled:opacity-40 flex items-center gap-1.5"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {t.save_button}
            </button>
          </div>
        )}
      </section>

      {/* ── Sección datos del perfil ─────────────────────────────────────── */}
      <section className="card p-6">
        <h2 className="text-sm font-bold text-text-primary mb-5 flex items-center gap-2">
          <User className="w-4 h-4 text-brand-400" />
          {t.public_info}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">
              {t.full_name}
            </label>
            <div className="relative">
              <input
                {...register('name')}
                className={cn('input pl-10', errors.name && 'border-red-500/50')}
                placeholder={t.name_placeholder}
              />
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            </div>
            {errors.name && (
              <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">
              {t.bio}
            </label>
            <div className="relative">
              <textarea
                {...register('bio')}
                className="input pl-10 h-24 resize-none text-sm py-3"
                placeholder={t.bio_placeholder}
              />
              <AlignLeft className="absolute left-3.5 top-4 w-4 h-4 text-text-muted" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">{t.city}</label>
              <div className="relative">
                <input
                  {...register('location')}
                  className="input pl-10 text-sm"
                  placeholder={t.city_placeholder}
                />
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">{t.country}</label>
              <div className="relative">
                <select
                  {...register('country')}
                  className="input pl-10 text-sm bg-surface appearance-none"
                >
                  <option value="">{t.select_country}</option>
                  {(t.countries_list || []).map((c: string) => <option key={c} value={c}>{c}</option>)}
                </select>
                <Pin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">
              {t.website}
            </label>
            <div className="relative">
              <input
                {...register('website')}
                className={cn('input pl-10 text-sm', errors.website && 'border-red-500/50')}
                placeholder={t.website_placeholder}
              />
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            </div>
            {errors.website && (
              <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.website.message}</p>
            )}
          </div>

          <div className="pt-4 border-t border-surface-border flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary flex items-center gap-2 px-8"
            >
              {isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" /> {t.saving}</>
                : <><Save className="w-4 h-4" /> {t.save_changes}</>
              }
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
