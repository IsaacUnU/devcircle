'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { Shield, Lock, Mail, LogOut, Trash2, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { changePassword, changeEmail, revokeAllSessions, deleteAccount } from '@/lib/actions/settings'
import { signOut } from 'next-auth/react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface SecurityTabProps {
  isOAuth: boolean   // true si solo tiene cuenta GitHub/Google (sin contraseña)
  email: string
}

export function SecurityTab({ isOAuth, email }: SecurityTabProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [deletePass, setDeletePass] = useState('')
  const [isPendingDelete, startDelete] = useTransition()

  // ── Cambiar contraseña ──────────────────────────────────────────────────────
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [isPendingPass, startPass] = useTransition()
  const passForm = useForm<{ current: string; next: string; confirm: string }>()

  const onChangePassword = (data: any) => {
    startPass(async () => {
      try { await changePassword(data); toast.success('Contraseña actualizada'); passForm.reset() }
      catch (e: any) { toast.error(e.message) }
    })
  }

  // ── Cambiar email ───────────────────────────────────────────────────────────
  const [isPendingEmail, startEmail] = useTransition()
  const emailForm = useForm<{ email: string; password: string }>({ defaultValues: { email } })

  const onChangeEmail = (data: any) => {
    startEmail(async () => {
      try { await changeEmail(data); toast.success('Email actualizado'); emailForm.reset() }
      catch (e: any) { toast.error(e.message) }
    })
  }

  // ── Eliminar cuenta ─────────────────────────────────────────────────────────
  const handleDelete = () => {
    if (deleteInput !== 'ELIMINAR MI CUENTA') return toast.error('Escribe la frase de confirmación')
    startDelete(async () => {
      try {
        await deleteAccount(deletePass)
        toast.success('Cuenta eliminada')
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
            <Lock className="w-4 h-4 text-brand-400" /> Cambiar contraseña
          </h2>
          <form onSubmit={passForm.handleSubmit(onChangePassword)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">Contraseña actual</label>
              <div className="relative">
                <input {...passForm.register('current')} type={showCurrent ? 'text' : 'password'} className="input pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowCurrent(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">Nueva contraseña</label>
                <div className="relative">
                  <input {...passForm.register('next')} type={showNew ? 'text' : 'password'} className="input pr-10" placeholder="Mínimo 8 caracteres" />
                  <button type="button" onClick={() => setShowNew(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">Confirmar</label>
                <input {...passForm.register('confirm')} type="password" className="input" placeholder="Repite la contraseña" />
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button type="submit" disabled={isPendingPass} className="btn-primary px-8">
                {isPendingPass ? 'Guardando...' : 'Actualizar contraseña'}
              </button>
            </div>
          </form>
        </section>
      ) : (
        <section className="card p-6 border-yellow-500/10">
          <div className="flex items-start gap-3 text-yellow-400">
            <Shield className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold">Cuenta OAuth</p>
              <p className="text-xs text-text-muted mt-1">Tu cuenta está vinculada a GitHub/Google. La contraseña se gestiona desde esa plataforma.</p>
            </div>
          </div>
        </section>
      )}

      {/* Cambiar email */}
      <section className="card p-6">
        <h2 className="text-sm font-bold text-text-primary mb-1 flex items-center gap-2">
          <Mail className="w-4 h-4 text-brand-400" /> Cambiar email
        </h2>
        <p className="text-xs text-text-muted mb-5">Email actual: <span className="text-text-secondary font-medium">{email}</span></p>
        {!isOAuth ? (
          <form onSubmit={emailForm.handleSubmit(onChangeEmail)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">Nuevo email</label>
              <input {...emailForm.register('email')} type="email" className="input" placeholder="nuevo@email.com" />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">Contraseña actual (para confirmar)</label>
              <input {...emailForm.register('password')} type="password" className="input" placeholder="••••••••" />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={isPendingEmail} className="btn-primary px-8">
                {isPendingEmail ? 'Guardando...' : 'Cambiar email'}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-xs text-text-muted">Gestiona tu email desde tu cuenta de GitHub/Google.</p>
        )}
      </section>

      {/* Sesiones */}
      <section className="card p-6">
        <h2 className="text-sm font-bold text-text-primary mb-1 flex items-center gap-2">
          <LogOut className="w-4 h-4 text-brand-400" /> Sesiones activas
        </h2>
        <p className="text-xs text-text-muted mb-5">Cierra tu sesión en todos los dispositivos donde hayas iniciado sesión.</p>
        <button
          onClick={async () => {
            try { await revokeAllSessions(); await signOut({ callbackUrl: '/auth/login' }); toast.success('Sesiones cerradas') }
            catch (e: any) { toast.error(e.message) }
          }}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <LogOut className="w-4 h-4" /> Cerrar sesión en todos los dispositivos
        </button>
      </section>

      {/* Eliminar cuenta */}
      <section className="card p-6 border-red-500/20">
        <h2 className="text-sm font-bold text-red-400 mb-1 flex items-center gap-2">
          <Trash2 className="w-4 h-4" /> Eliminar cuenta
        </h2>
        <p className="text-xs text-text-muted mb-5">Esta acción es <span className="text-red-400 font-bold">permanente e irreversible</span>. Se borrarán todos tus posts, comentarios, seguidores y datos.</p>

        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 text-sm font-bold hover:bg-red-500/10 transition-all">
            <Trash2 className="w-4 h-4" /> Eliminar mi cuenta
          </button>
        ) : (
          <div className="space-y-4 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <p className="text-xs font-bold">Escribe <span className="font-mono bg-red-500/10 px-1 rounded">ELIMINAR MI CUENTA</span> para confirmar</p>
            </div>
            <input
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              className="input text-sm border-red-500/30 focus:border-red-500"
              placeholder="ELIMINAR MI CUENTA"
            />
            {!isOAuth && (
              <input
                value={deletePass}
                onChange={e => setDeletePass(e.target.value)}
                type="password"
                className="input text-sm border-red-500/30"
                placeholder="Contraseña actual"
              />
            )}
            <div className="flex gap-3">
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); setDeletePass('') }}
                className="btn-secondary text-sm px-5">Cancelar</button>
              <button
                onClick={handleDelete}
                disabled={isPendingDelete || deleteInput !== 'ELIMINAR MI CUENTA'}
                className={cn('flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all',
                  deleteInput === 'ELIMINAR MI CUENTA'
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-red-500/20 text-red-400/50 cursor-not-allowed'
                )}
              >
                {isPendingDelete ? 'Eliminando...' : 'Confirmar eliminación'}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
