'use client'

import { useState, useTransition } from 'react'
import { UserPlus, UserMinus } from 'lucide-react'
import { toggleFollow } from '@/lib/actions/users'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Props {
  targetUserId: string
  initialFollowing: boolean
  username: string
  className?: string
}

export function FollowButton({ targetUserId, initialFollowing, username, className }: Props) {
  const [following, setFollowing] = useState(initialFollowing)
  const [isPending, startTransition] = useTransition()

  function handleFollow() {
    setFollowing(prev => !prev)
    startTransition(async () => {
      try {
        await toggleFollow(targetUserId)
        toast.success(following ? `Dejaste de seguir a @${username}` : `Ahora sigues a @${username}`)
      } catch (err: any) {
        setFollowing(prev => !prev)
        toast.error(err.message)
      }
    })
  }

  return (
    <button
      onClick={handleFollow}
      disabled={isPending}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150',
        following
          ? 'border border-surface-border text-text-secondary hover:border-red-400 hover:text-red-400 hover:bg-red-400/5'
          : 'btn-primary',
        className
      )}
    >
      {following ? (
        <><UserMinus className="w-4 h-4" /> Siguiendo</>
      ) : (
        <><UserPlus className="w-4 h-4" /> Seguir</>
      )}
    </button>
  )
}
