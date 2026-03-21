'use client'

import Link from 'next/link'
import { Users, Lock, Globe, BadgeCheck } from 'lucide-react'
import { getAvatarUrl } from '@/lib/utils'

interface GroupCardProps {
  group: {
    id: string
    name: string
    description: string | null
    image: string | null
    banner: string | null
    isPrivate: boolean
    isVerified: boolean
    creatorId: string
    _count: { members: number; posts: number }
    creator: { id: string; username: string; name: string | null; image: string | null }
    members: { user: { id: string; image: string | null; username: string } }[]
  }
}

export function GroupCard({ group }: GroupCardProps) {
  // Igual que en GroupPageClient — lee el banner color o imagen
  const bannerStyle = group.banner?.startsWith('color:')
    ? { background: `linear-gradient(135deg, ${group.banner.split(':')[1]}, ${group.banner.split(':')[2]})` }
    : {}
  const hasBannerImg = group.banner && !group.banner.startsWith('color:')
  const accentColor = group.banner?.startsWith('color:') ? group.banner.split(':')[1] : null

  return (
    <Link href={`/groups/${group.id}`} className="card group overflow-hidden hover:border-brand-500/30 transition-all block">
      {/* Banner */}
      <div className="relative h-24 overflow-hidden" style={bannerStyle}>
        {hasBannerImg && (
          <img src={group.banner!} alt="" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
        )}
        {!group.banner && (
          <div className="w-full h-full bg-gradient-to-br from-brand-500/20 via-brand-400/10 to-transparent" />
        )}
        {/* Privacy badge */}
        <div className="absolute top-3 right-3">
          {group.isPrivate
            ? <span className="flex items-center gap-1 text-[10px] font-bold bg-black/50 text-white px-2 py-1 rounded-full backdrop-blur-sm"><Lock className="w-3 h-3" /> Privado</span>
            : <span className="flex items-center gap-1 text-[10px] font-bold bg-brand-500/30 text-brand-300 px-2 py-1 rounded-full backdrop-blur-sm"><Globe className="w-3 h-3" /> Público</span>
          }
        </div>
        {/* Avatar */}
        <div className="absolute -bottom-6 left-5">
          {group.image
            ? <img src={group.image} alt={group.name} className="w-12 h-12 rounded-2xl border-2 border-surface object-cover shadow-xl" />
            : <div className="w-12 h-12 rounded-2xl border-2 border-surface bg-surface-hover flex items-center justify-center shadow-xl">
                <Users className="w-6 h-6 text-brand-400" />
              </div>
          }
        </div>
      </div>

      <div className="p-5 pt-9">
        <h3 className="text-base font-bold text-text-primary group-hover:text-brand-400 transition-colors mb-1 flex items-center gap-1.5 min-w-0">
          <span className="truncate">{group.name}</span>
          {group.isVerified && (
            <BadgeCheck
              className="w-4 h-4 shrink-0"
              style={{ color: accentColor ?? '#38bdf8' }}
              title="Grupo verificado"
            />
          )}
        </h3>
        <p className="text-xs text-text-muted line-clamp-2 mb-4 leading-relaxed min-h-[2.5rem]">
          {group.description || 'Sin descripción para esta comunidad.'}
        </p>

        <div className="flex items-center justify-between">
          {/* Avatares de miembros */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {group.members.slice(0, 4).map(m => (
                <img
                  key={m.user.id}
                  src={m.user.image ?? getAvatarUrl(m.user.username)}
                  alt={m.user.username}
                  className="w-6 h-6 rounded-full border-2 border-surface object-cover"
                />
              ))}
            </div>
            <span className="text-xs text-text-muted font-medium">
              {group._count.members} miembro{group._count.members !== 1 ? 's' : ''}
            </span>
          </div>
          <span className="text-[10px] text-text-muted">{group._count.posts} posts</span>
        </div>
      </div>
    </Link>
  )
}
