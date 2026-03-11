'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Crown, Lock, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { joinViaInviteToken } from '@/lib/actions/groups'

export function JoinViaInviteClient({ token, group, isLoggedIn }: {
  token: string; group: any; isLoggedIn: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleJoin = () => startTransition(async () => {
    if (!isLoggedIn) { router.push(`/auth/login?callbackUrl=/groups/invite/${token}`); return }
    try {
      const groupId = await joinViaInviteToken(token)
      toast.success('¡Te has unido al grupo!')
      router.push(`/groups/${groupId}`)
    } catch (e: any) { toast.error(e.message) }
  })

  return (
    <div className="card w-full max-w-md p-8 text-center space-y-6">
      <div className="w-20 h-20 rounded-2xl border-2 border-surface-border bg-surface-hover flex items-center justify-center mx-auto">
        {group.image
          ? <img src={group.image} alt={group.name} className="w-full h-full object-cover rounded-2xl" />
          : <Users className="w-10 h-10 text-brand-400" />
        }
      </div>
      <div>
        <div className="flex items-center justify-center gap-2 mb-1">
          <h1 className="text-2xl font-black text-text-primary">{group.name}</h1>
          <Lock className="w-4 h-4 text-text-muted" />
        </div>
        {group.description && <p className="text-sm text-text-secondary mb-3">{group.description}</p>}
        <div className="flex items-center justify-center gap-3 text-xs text-text-muted">
          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {group._count.members} miembros</span>
          <span>· Creado por</span>
          <span className="flex items-center gap-1 text-brand-400"><Crown className="w-3 h-3" /> {group.creator.name ?? group.creator.username}</span>
        </div>
      </div>
      <p className="text-sm text-text-muted">Has sido invitado a unirte a este grupo privado.</p>
      <button onClick={handleJoin} disabled={isPending}
        className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base font-bold disabled:opacity-40">
        {isPending ? 'Uniéndose...' : 'Aceptar invitación'} <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}
