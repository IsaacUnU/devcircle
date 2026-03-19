import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { Trophy, TrendingUp, Star, Users, FileText, Heart } from 'lucide-react'
import Link from 'next/link'
import { getAvatarUrl } from '@/lib/utils'

export const metadata: Metadata = { title: 'Leaderboard · Devora' }

async function getLeaderboardData() {
  const [byReputation, byPosts, byFollowers] = await Promise.all([
    // Top por reputación
    db.user.findMany({
      take: 10,
      orderBy: { reputation: 'desc' },
      select: {
        id: true, username: true, name: true, image: true, reputation: true,
        _count: { select: { posts: true, followers: true } },
      },
    }),
    // Top por posts
    db.user.findMany({
      take: 10,
      orderBy: { posts: { _count: 'desc' } },
      select: {
        id: true, username: true, name: true, image: true, reputation: true,
        _count: { select: { posts: true, followers: true } },
      },
    }),
    // Top por seguidores
    db.user.findMany({
      take: 10,
      orderBy: { followers: { _count: 'desc' } },
      select: {
        id: true, username: true, name: true, image: true, reputation: true,
        _count: { select: { posts: true, followers: true } },
      },
    }),
  ])
  return { byReputation, byPosts, byFollowers }
}

const MEDAL = ['🥇', '🥈', '🥉']

function LeaderCard({
  user, rank, metric, metricLabel, icon: Icon,
}: {
  user: any, rank: number, metric: number, metricLabel: string, icon: any
}) {
  const medal = rank < 3 ? MEDAL[rank] : null
  const isTop = rank === 0

  return (
    <Link
      href={`/profile/${user.username}`}
      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:border-brand-500/40 hover:bg-brand-500/5 ${
        isTop
          ? 'border-brand-500/30 bg-brand-500/10'
          : 'border-surface-border bg-surface'
      }`}
    >
      <span className="w-8 text-center text-lg font-black text-text-muted">
        {medal ?? <span className="text-sm">#{rank + 1}</span>}
      </span>
      <img
        src={user.image ?? getAvatarUrl(user.username)}
        alt=""
        className={`rounded-full object-cover border-2 ${isTop ? 'w-12 h-12 border-brand-500' : 'w-10 h-10 border-surface-border'}`}
      />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-text-primary text-sm truncate">{user.name ?? user.username}</p>
        <p className="text-xs text-text-muted">@{user.username}</p>
      </div>
      <div className="flex items-center gap-1.5 text-brand-400 font-bold text-sm shrink-0">
        <Icon className="w-4 h-4" />
        <span>{metric.toLocaleString()}</span>
        <span className="text-xs text-text-muted font-normal">{metricLabel}</span>
      </div>
    </Link>
  )
}

export default async function LeaderboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/login')

  const { byReputation, byPosts, byFollowers } = await getLeaderboardData()

  const sections = [
    {
      title: 'Top Reputación',
      description: 'Devs con más puntos de reputación en la comunidad',
      icon: Star,
      color: 'text-amber-400',
      users: byReputation,
      metric: (u: any) => u.reputation,
      metricLabel: 'pts',
    },
    {
      title: 'Top Publicadores',
      description: 'Los devs que más contenido comparten',
      icon: FileText,
      color: 'text-blue-400',
      users: byPosts,
      metric: (u: any) => u._count.posts,
      metricLabel: 'posts',
    },
    {
      title: 'Top Seguidores',
      description: 'Los devs más seguidos de Devora',
      icon: Users,
      color: 'text-brand-400',
      users: byFollowers,
      metric: (u: any) => u._count.followers,
      metricLabel: 'seguidores',
    },
  ]

  return (
    <main className="flex-1 max-w-2xl lg:max-w-3xl xl:max-w-2xl px-4 sm:px-6 py-4 sm:py-6 border-x border-surface-border min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Trophy className="w-7 h-7 text-amber-400" />
        <h1 className="text-2xl font-black text-text-primary">Leaderboard</h1>
      </div>
      <p className="text-sm text-text-muted mb-8">Los devs más activos e influyentes de la comunidad</p>

      <div className="space-y-10">
        {sections.map(({ title, description, icon: Icon, color, users, metric, metricLabel }) => (
          <section key={title}>
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-5 h-5 ${color}`} />
              <h2 className="text-base font-bold text-text-primary">{title}</h2>
            </div>
            <p className="text-xs text-text-muted mb-4">{description}</p>
            <div className="space-y-2">
              {users.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-8">Sin datos todavía</p>
              ) : (
                users.map((user, i) => (
                  <LeaderCard
                    key={user.id}
                    user={user}
                    rank={i}
                    metric={metric(user)}
                    metricLabel={metricLabel}
                    icon={Icon}
                  />
                ))
              )}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
