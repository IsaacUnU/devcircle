'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { Shield, Lock, Mail, LogOut, Trash2, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { changePassword, changeEmail, revokeAllSessions, deleteAccount } from '@/lib/actions/settings'
import { signOut } from 'next-auth/react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'

interface SecurityTabProps {
  isOAuth: boolean   // true si solo tiene cuenta GitHub/Google (sin contraseña)
  email: string
}

export function SecurityTab({ isOAuth, email }: SecurityTabProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [deletePass, setDeletePass] = useState('')
  const [isPendingDelete, startDelete] = useTransition()
  const { dict } = useTranslation()
  const t = (dict as any).settings.security

  // ── Cambiar contraseña ──────────────────────────────────────────────────────
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [isPendingPass, startPass] = useTransition()
  const passForm = useForm<{ current: string; next: string; confirm: string }>()

  const onChangePassword = (data: any) => {
    startPass(async () => {
      try { await changePassword(data); toast.success(t.toasts.password_updated); passForm.reset() }
      catch (e: any) { toast.error(e.message) }
    })
  }

  // ── Cambiar email ───────────────────────────────────────────────────────────
  const [isPendingEmail, startEmail] = useTransition()
  const emailForm = useForm<{ email: string; password: string }>({ defaultValues: { email } })

  const onChangeEmail = (data: any) => {
    startEmail(async () => {
      try { await changeEmail(data); toast.success(t.toasts.email_updated); emailForm.reset() }
      catch (e: any) { toast.error(e.message) }
    })
  }

  // ── Eliminar cuenta ─────────────────────────────────────────────────────────
  const handleDelete = () => {
    if (deleteInput !== t.delete_input_placeholder) return toast.error(t.toasts.phrase_error)
    startDelete(async () => {
      try {
        await deleteAccount(deletePass)
        toast.success(t.toasts.account_deleted)
        await signOut({ callbackUrl: '/' })
      } catch (e: any) { toast.error(e.message) }
    })
  }

  return (
    <div className="space-y-6">

      {/* Cambiar contraseña */}
      {!isOAuth ? (
        <section className="card p-6">
          <h2 className="text-sm font-bold text-text-primary mb-5 flex items-center gap-2">
            <Lock className="w-4 h-4 text-brand-400" /> {t.password_title}
          </h2>
          <form onSubmit={passForm.handleSubmit(onChangePassword)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">{t.current_password}</label>
              <div className="relative">
                <input {...passForm.register('current')} type={showCurrent ? 'text' : 'password'} className="input pr-10" placeholder={t.password_placeholder} />
                <button type="button" onClick={() => setShowCurrent(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">{t.new_password}</label>
                <div className="relative">
                  <input {...passForm.register('next')} type={showNew ? 'text' : 'password'} className="input pr-10" placeholder={t.new_password_hint} />
                  <button type="button" onClick={() => setShowNew(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">{t.confirm_password}</label>
                <input {...passForm.register('confirm')} type="password" className="input" placeholder={t.confirm_placeholder} />
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button type="submit" disabled={isPendingPass} className="btn-primary px-8">
                {isPendingPass ? t.updating_password : t.update_button}
              </button>
            </div>
          </form>
        </section>
      ) : (
        <section className="card p-6 border-yellow-500/10">
          <div className="flex items-start gap-3 text-yellow-400">
            <Shield className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold">{t.oauth_title}</p>
              <p className="text-xs text-text-muted mt-1">{t.oauth_description}</p>
            </div>
          </div>
        </section>
      )}

      {/* Cambiar email */}
      <section className="card p-6">
        <h2 className="text-sm font-bold text-text-primary mb-1 flex items-center gap-2">
          <Mail className="w-4 h-4 text-brand-400" /> {t.email_title}
        </h2>
        <p className="text-xs text-text-muted mb-5">{t.current_email}: <span className="text-text-secondary font-medium">{email}</span></p>
        {!isOAuth ? (
          <form onSubmit={emailForm.handleSubmit(onChangeEmail)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">{t.new_email}</label>
              <input {...emailForm.register('email')} type="email" className="input" placeholder={t.new_email_placeholder || 'nuevo@email.com'} />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">{t.confirm_email_password}</label>
              <input {...emailForm.register('password')} type="password" className="input" placeholder={t.password_placeholder} />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={isPendingEmail} className="btn-primary px-8">
                {isPendingEmail ? t.updating_email : t.change_email_button}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-xs text-text-muted">{t.oauth_email_description}</p>
        )}
      </section>

      {/* Sesiones */}
      <section className="card p-6">
        <h2 className="text-sm font-bold text-text-primary mb-1 flex items-center gap-2">
          <LogOut className="w-4 h-4 text-brand-400" /> {t.sessions_title}
        </h2>
        <p className="text-xs text-text-muted mb-5">{t.sessions_description}</p>
        <button
          onClick={async () => {
            try { await revokeAllSessions(); await signOut({ callbackUrl: '/auth/login' }); toast.success(t.toasts.sessions_revoked) }
            catch (e: any) { toast.error(e.message) }
          }}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <LogOut className="w-4 h-4" /> {t.revoke_sessions_button}
        </button>
      </section>

      {/* Eliminar cuenta */}
      <section className="card p-6 border-red-500/20">
        <h2 className="text-sm font-bold text-red-400 mb-1 flex items-center gap-2">
          <Trash2 className="w-4 h-4" /> {t.delete_account_title}
        </h2>
        <p className="text-xs text-text-muted mb-5">{t.delete_account_description}</p>

        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 text-sm font-bold hover:bg-red-500/10 transition-all">
            <Trash2 className="w-4 h-4" /> {t.delete_account_button}
          </button>
        ) : (
          <div className="space-y-4 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <p className="text-xs font-bold">{t.delete_confirm_phrase}</p>
            </div>
            <input
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              className="input text-sm border-red-500/30 focus:border-red-500"
              placeholder={t.delete_input_placeholder}
            />
            {!isOAuth && (
              <input
                value={deletePass}
                onChange={e => setDeletePass(e.target.value)}
                type="password"
                className="input text-sm border-red-500/30"
                placeholder={t.current_password}
              />
            )}
            <div className="flex gap-3">
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); setDeletePass('') }}
                className="btn-secondary text-sm px-5">{t.cancel_button}</button>
              <button
                onClick={handleDelete}
                disabled={isPendingDelete || deleteInput !== t.delete_input_placeholder}
                className={cn('flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all',
                  deleteInput === t.delete_input_placeholder
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-red-500/20 text-red-400/50 cursor-not-allowed'
                )}
              >
                {isPendingDelete ? t.deleting : t.confirm_delete_button}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
