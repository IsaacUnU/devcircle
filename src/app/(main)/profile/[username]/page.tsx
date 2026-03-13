import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getUserProfile, getUserPosts } from '@/lib/queries'
import { PostCard } from '@/components/post/PostCard'
import { FollowButton } from '@/components/profile/FollowButton'
import { MessageButton } from '@/components/profile/MessageButton'
import { ProfileStats } from '@/components/profile/ProfileStats'
import { MapPin, LinkIcon, Calendar, Sparkles, Lock } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getAvatarUrl } from '@/lib/utils'
import { DEFAULT_PRIVACY, type PrivacySettings } from '@/lib/privacy'

interface Props { params: { username: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await getUserProfile(params.username)
  if (!user) return { title: 'Usuario no encontrado' }
  return {
    title: `${user.name ?? user.username} (@${user.username})`,
    description: user.bio ?? `Perfil de ${user.username} en DevCircle`,
  }
}

export default async function ProfilePage({ params }: Props) {
  const [session, user, posts] = await Promise.all([
    auth(),
    getUserProfile(params.username),
    getUserPosts(params.username),
  ])

  if (!user) notFound()

  const isOwn      = session?.user?.id === user.id
  const isFollowing = (user.followers?.length ?? 0) > 0
  const avatar     = user.image ?? getAvatarUrl(user.username)
  const privacy: PrivacySettings = { ...DEFAULT_PRIVACY, ...((user.privacySettings as any) ?? {}) }
  const isPrivate  = privacy.isPrivate && !isOwn && !isFollowing

  // Visibilidad de listas según privacidad
  const canSeeFollowers = isOwn
    || privacy.showFollowers === 'everyone'
    || (privacy.showFollowers === 'followers' && isFollowing)

  const canSeeFollowing = isOwn
    || privacy.showFollowing === 'everyone'
    || (privacy.showFollowing === 'followers' && isFollowing)

  return (
    <div className="flex w-full justify-center xl:justify-start">
      <main className="flex-1 max-w-2xl px-4 sm:px-6 py-4 sm:py-6 border-x border-surface-border min-h-screen">
        {/* Profile header */}
        <div className="card p-4 sm:p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="relative">
              <img src={avatar} alt="" className="w-16 h-16 avatar" />
              {privacy.isPrivate && (
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-surface rounded-full flex items-center justify-center border border-surface-border">
                  <Lock className="w-2.5 h-2.5 text-text-muted" />
                </span>
              )}
            </div>
            {!isOwn && session && (
              <div className="flex items-center gap-2">
                <MessageButton targetUserId={user.id} />
                <FollowButton
                  targetUserId={user.id}
                  initialFollowing={isFollowing}
                  username={user.username}
                  isPrivate={privacy.isPrivate}
                  initialRequested={(user as any).hasPendingRequest ?? false}
                />
              </div>
            )}
            {isOwn && (
              <a href="/settings" className="btn-secondary text-sm">Editar perfil</a>
            )}
          </div>

          <h1 className="text-xl font-bold text-text-primary">{user.name ?? user.username}</h1>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-text-muted text-sm">@{user.username}</p>
            {privacy.isPrivate && (
              <span className="flex items-center gap-1 text-[10px] text-text-muted border border-surface-border rounded-full px-2 py-0.5">
                <Lock className="w-2.5 h-2.5" /> Privado
              </span>
            )}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20">
              <Sparkles className="w-3 h-3 text-brand-400" />
              <span className="text-[10px] font-bold text-brand-400">{user.reputation ?? 0} REP</span>
            </div>
          </div>

          {(!isPrivate || isOwn) && user.bio && (
            <p className="text-text-secondary text-sm mb-3 leading-relaxed">{user.bio}</p>
          )}

          <div className="flex flex-wrap gap-3 text-xs text-text-muted mb-4">
            {user.location && (
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {user.location}</span>
            )}
            {user.website && !isPrivate && (
              <a href={user.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-brand-400 hover:text-brand-300">
                <LinkIcon className="w-3.5 h-3.5" /> {user.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Se unió en {format(new Date(user.createdAt), 'MMMM yyyy', { locale: es })}
            </span>
          </div>

          <ProfileStats
            username={user.username}
            postsCount={user._count.posts}
            followersCount={user._count.followers}
            followingCount={user._count.following}
            currentUserId={session?.user?.id}
            canSeeFollowers={canSeeFollowers}
            canSeeFollowing={canSeeFollowing}
          />
        </div>

        {/* Posts — ocultos si privado y no sigues */}
        {isPrivate ? (
          <div className="card p-12 text-center space-y-3">
            <Lock className="w-10 h-10 mx-auto text-text-muted opacity-30" />
            <p className="font-semibold text-text-secondary">Esta cuenta es privada</p>
            <p className="text-sm text-text-muted">Sigue a @{user.username} para ver sus posts</p>
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map(post => (
              <PostCard key={post.id} post={post as any} currentUserId={session?.user?.id} />
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <p className="text-text-muted">Todavía no hay posts</p>
          </div>
        )}
      </main>
    </div>
  )
}
