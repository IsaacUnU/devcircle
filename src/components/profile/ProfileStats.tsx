'use client'

import { useState } from 'react'
import { FollowersModal } from '@/components/profile/FollowersModal'
import { formatCount } from '@/lib/utils'
import { Lock } from 'lucide-react'

interface ProfileStatsProps {
  username: string
  postsCount: number
  followersCount: number
  followingCount: number
  currentUserId?: string
  canSeeFollowers?: boolean
  canSeeFollowing?: boolean
}

export function ProfileStats({
  username, postsCount, followersCount, followingCount,
  currentUserId, canSeeFollowers = true, canSeeFollowing = true,
}: ProfileStatsProps) {
  const [modal, setModal] = useState<'followers' | 'following' | null>(null)

  return (
    <>
      <div className="flex gap-5 text-sm">
        <div>
          <span className="font-semibold text-text-primary">{formatCount(postsCount)}</span>
          <span className="text-text-muted ml-1">posts</span>
        </div>

        {/* Seguidores */}
        {canSeeFollowers ? (
          <button
            onClick={() => setModal('followers')}
            className="hover:underline underline-offset-2 group"
          >
            <span className="font-semibold text-text-primary group-hover:text-brand-400 transition-colors">
              {formatCount(followersCount)}
            </span>
            <span className="text-text-muted ml-1">seguidores</span>
          </button>
        ) : (
          <div className="flex items-center gap-1 text-text-muted cursor-default" title="Lista privada">
            <Lock className="w-3 h-3" />
            <span className="text-text-muted">seguidores</span>
          </div>
        )}

        {/* Siguiendo */}
        {canSeeFollowing ? (
          <button
            onClick={() => setModal('following')}
            className="hover:underline underline-offset-2 group"
          >
            <span className="font-semibold text-text-primary group-hover:text-brand-400 transition-colors">
              {formatCount(followingCount)}
            </span>
            <span className="text-text-muted ml-1">siguiendo</span>
          </button>
        ) : (
          <div className="flex items-center gap-1 text-text-muted cursor-default" title="Lista privada">
            <Lock className="w-3 h-3" />
            <span className="text-text-muted">siguiendo</span>
          </div>
        )}
      </div>

      {modal && (
        <FollowersModal
          username={username}
          initialTab={modal}
          followersCount={followersCount}
          followingCount={followingCount}
          currentUserId={currentUserId}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}
