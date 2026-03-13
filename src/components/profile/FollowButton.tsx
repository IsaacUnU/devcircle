'use client'

import { useState, useTransition } from 'react'
import { UserPlus, UserMinus, Clock, UserCheck } from 'lucide-react'
import { toggleFollow } from '@/lib/actions/users'
import { sendFollowRequest, cancelFollowRequest } from '@/lib/actions/privacy'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Props {
  targetUserId: string
  initialFollowing: boolean
  username: string
  isPrivate?: boolean          // ¿El perfil es privado?
  initialRequested?: boolean   // ¿Ya hay solicitud pendiente?
  className?: string
}

export function FollowButton({
  targetUserId, initialFollowing, username,
  isPrivate = false, initialRequested = false, className,
}: Props) {
  const [following,  setFollowing]  = useState(initialFollowing)
  const [requested,  setRequested]  = useState(initialRequested)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      try {
        // Caso 1: ya sigues → dejar de seguir
        if (following) {
          setFollowing(false)
          await toggleFollow(targetUserId)
          toast.success(`Dejaste de seguir a @${username}`)
          return
        }

        // Caso 2: perfil privado y solicitud pendiente → cancelar
        if (isPrivate && requested) {
          setRequested(false)
          await cancelFollowRequest(targetUserId)
          toast.success('Solicitud cancelada')
          return
        }

        // Caso 3: perfil privado sin solicitud → enviar solicitud
        if (isPrivate && !requested) {
          setRequested(true)
          await sendFollowRequest(targetUserId)
          toast.success(`Solicitud enviada a @${username}`)
          return
        }

        // Caso 4: perfil público → follow directo
        setFollowing(true)
        await toggleFollow(targetUserId)
        toast.success(`Ahora sigues a @${username}`)
      } catch (err: any) {
        // Revertir optimistic
        setFollowing(initialFollowing)
        setRequested(initialRequested)
        toast.error(err.message)
      }
    })
  }

  // ── Apariencia según estado ──────────────────────────────────────────────
  const isRequested = isPrivate && requested && !following

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150',
        following
          ? 'border border-surface-border text-text-secondary hover:border-red-400 hover:text-red-400 hover:bg-red-400/5'
          : isRequested
            ? 'border border-brand-500/40 text-brand-400 bg-brand-500/10 hover:bg-red-400/5 hover:border-red-400/40 hover:text-red-400'
            : 'btn-primary',
        className
      )}
    >
      {following   ? <><UserMinus className="w-4 h-4" /> Siguiendo</>
       : isRequested ? <><Clock className="w-4 h-4" /> Solicitado</>
       : <><UserPlus className="w-4 h-4" /> Seguir</>
      }
    </button>
  )
}
