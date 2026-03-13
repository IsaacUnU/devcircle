'use client'

import { useState, useTransition, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Users, ArrowLeft, Settings, Lock, Globe, Crown,
  LogOut, UserMinus, Send, Trash2, Shield, CheckCircle,
  BellOff, Bell, RefreshCw, Palette, Image as ImageIcon, Upload,
  Link2, Copy, UserCheck, UserX, ClipboardCheck
} from 'lucide-react'
import { getAvatarUrl, cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import {
  joinGroup, leaveGroup, updateGroup,
  deleteGroup, kickMember, createGroupPost,
  requestJoinGroup, respondToJoinRequest, generateInviteLink
} from '@/lib/actions/groups'

// Colores predefinidos para el banner del grupo
const GROUP_COLORS = [
  { label: 'Verde',    from: '#16a34a', to: '#4ade80' },
  { label: 'Azul',     from: '#2563eb', to: '#60a5fa' },
  { label: 'Púrpura',  from: '#7c3aed', to: '#a78bfa' },
  { label: 'Rosa',     from: '#db2777', to: '#f472b6' },
  { label: 'Naranja',  from: '#ea580c', to: '#fb923c' },
  { label: 'Cian',     from: '#0891b2', to: '#22d3ee' },
  { label: 'Rojo',     from: '#dc2626', to: '#f87171' },
  { label: 'Oscuro',   from: '#1e293b', to: '#475569' },
]

interface GroupPageClientProps {
  group: any
  currentUserId: string | null
}

export function GroupPageClient({ group: initialGroup, currentUserId }: GroupPageClientProps) {
  const router = useRouter()
  const [group, setGroup]           = useState(initialGroup)
  const [tab, setTab]               = useState<'feed' | 'members' | 'requests'>('feed')
  const [showEditModal, setShowEditModal] = useState(false)
  const [postContent, setPostContent]    = useState('')
  const [isPending, startTransition]     = useTransition()
  const [inviteLink, setInviteLink]      = useState<string | null>(null)
  const [joinRequested, setJoinRequested] = useState(false)
  const [muted, setMuted]           = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(`group-muted-${initialGroup.id}`) === 'true'
  })
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  const isAdmin   = group.myRole === 'ADMIN'
  const isMember  = group.isMember
  const isCreator = group.creatorId === currentUserId

  // ── Auto-refresh de posts cada 8 segundos ──────────────────────────────────
  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch(`/api/groups/${group.id}/posts`)
      if (!res.ok) return
      const data = await res.json()
      setGroup((prev: any) => ({ ...prev, posts: data.posts, _count: { ...prev._count, posts: data.posts.length } }))
    } catch {}
  }, [group.id])

  useEffect(() => {
    if (tab !== 'feed') return
    pollRef.current = setInterval(fetchPosts, 8000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [tab, fetchPosts])

  const toggleMute = () => {
    const next = !muted
    setMuted(next)
    localStorage.setItem(`group-muted-${group.id}`, String(next))
    toast.success(next ? '🔕 Grupo silenciado' : '🔔 Notificaciones activadas')
  }

  const handleRequestJoin = () => startTransition(async () => {
    try { await requestJoinGroup(group.id); setJoinRequested(true); toast.success('Solicitud enviada al admin') }
    catch (e: any) { toast.error(e.message) }
  })

  const handleRespondRequest = (inviteId: string, accept: boolean) => startTransition(async () => {
    try {
      await respondToJoinRequest(inviteId, accept)
      toast.success(accept ? 'Solicitud aceptada' : 'Solicitud rechazada')
    } catch (e: any) { toast.error(e.message) }
  })

  const handleGenerateInviteLink = () => startTransition(async () => {
    try {
      const token = await generateInviteLink(group.id)
      const link = `${window.location.origin}/groups/invite/${token}`
      setInviteLink(link)
      await navigator.clipboard.writeText(link)
      toast.success('Enlace copiado al portapapeles')
    } catch (e: any) { toast.error(e.message) }
  })

  const handleJoin = () => startTransition(async () => {
    try { await joinGroup(group.id); toast.success('¡Te has unido al grupo!') }
    catch (e: any) { toast.error(e.message) }
  })

  const handleLeave = () => startTransition(async () => {
    if (!confirm('¿Seguro que quieres salir del grupo?')) return
    try {
      await leaveGroup(group.id)
      toast.success('Has salido del grupo')
      router.push('/groups')
    } catch (e: any) { toast.error(e.message) }
  })

  const handleDelete = () => startTransition(async () => {
    if (!confirm('¿Eliminar el grupo permanentemente?')) return
    try { await deleteGroup(group.id); toast.success('Grupo eliminado'); router.push('/groups') }
    catch (e: any) { toast.error(e.message) }
  })

  const handlePost = () => {
    if (!postContent.trim()) return
    startTransition(async () => {
      try {
        await createGroupPost(group.id, postContent)
        setPostContent('')
        toast.success('Post publicado')
        await fetchPosts() // refresco inmediato tras publicar
      } catch (e: any) { toast.error(e.message) }
    })
  }

  const handleKick = (userId: string, name: string) => startTransition(async () => {
    if (!confirm(`¿Expulsar a ${name}?`)) return
    try { await kickMember(group.id, userId); toast.success(`${name} expulsado`) }
    catch (e: any) { toast.error(e.message) }
  })

  // ── Grupo privado y no miembro → pantalla de acceso restringido ─────────────
  if (group.isPrivate && !isMember) {
    return (
      <div className="space-y-4">
        <Link href="/groups" className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Volver a grupos
        </Link>
        <div className="card overflow-hidden">
          <div className="relative h-36" style={
            group.banner?.startsWith('color:')
              ? { background: `linear-gradient(135deg, ${group.banner.split(':')[1]}, ${group.banner.split(':')[2]})` }
              : {}
          }>
            {!group.banner && <div className="w-full h-full bg-gradient-to-br from-brand-500/20 via-brand-400/10 to-transparent" />}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <Lock className="w-10 h-10 text-white/50" />
            </div>
          </div>
          <div className="px-6 py-8 text-center">
            <div className="w-16 h-16 rounded-2xl border-2 border-surface-border bg-surface-hover flex items-center justify-center mx-auto mb-4">
              {group.image
                ? <img src={group.image} alt={group.name} className="w-full h-full object-cover rounded-2xl" />
                : <Users className="w-8 h-8 text-brand-400" />
              }
            </div>
            <h1 className="text-xl font-black text-text-primary mb-1">{group.name}</h1>
            <div className="flex items-center justify-center gap-1 text-xs text-text-muted mb-4">
              <Lock className="w-3 h-3" /> Grupo privado · {group._count.members} miembro{group._count.members !== 1 ? 's' : ''}
            </div>
            <p className="text-sm text-text-secondary mb-6 max-w-sm mx-auto">
              Este grupo es privado. Solicita acceso al administrador para ver su contenido.
            </p>
            {!currentUserId ? (
              <Link href="/auth/login" className="btn-primary px-6 py-2.5 text-sm inline-flex items-center gap-2">
                <Lock className="w-4 h-4" /> Inicia sesión para solicitar acceso
              </Link>
            ) : (
              <button onClick={handleRequestJoin} disabled={isPending || joinRequested}
                className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2 mx-auto disabled:opacity-60">
                <Lock className="w-4 h-4" />
                {joinRequested ? '✓ Solicitud enviada' : 'Solicitar acceso'}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Render principal (miembro o grupo público) ────────────────────────────
  const bannerStyle = group.banner?.startsWith('color:')
    ? { background: `linear-gradient(135deg, ${group.banner.split(':')[1]}, ${group.banner.split(':')[2]})` }
    : {}

  return (
    <div className="space-y-4">
      <Link href="/groups" className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Volver a grupos
      </Link>

      {/* ── Header / Banner ── */}
      <div className="card overflow-hidden">
        <div className="relative h-36" style={bannerStyle}>
          {group.banner && !group.banner.startsWith('color:') && (
            <img src={group.banner} alt="" className="w-full h-full object-cover opacity-70" />
          )}
          {!group.banner && <div className="w-full h-full bg-gradient-to-br from-brand-500/20 via-brand-400/10 to-transparent" />}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-surface to-transparent" />
        </div>

          <div className="px-4 sm:px-6 pb-5 -mt-8 relative">
          <div className="flex items-start sm:items-end justify-between mb-3 gap-2">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-4 border-surface overflow-hidden bg-surface-hover flex items-center justify-center shadow-xl shrink-0">
              {group.image
                ? <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
                : <Users className="w-7 h-7 sm:w-8 sm:h-8 text-brand-400" />
              }
            </div>
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {!currentUserId && <span className="text-xs text-text-muted">Inicia sesión para unirte</span>}
              {currentUserId && !isMember && !group.isPrivate && (
                <button onClick={handleJoin} disabled={isPending} className="btn-primary px-3 sm:px-4 py-2 text-sm">Unirse</button>
              )}
              {currentUserId && !isMember && group.isPrivate && (
                <button onClick={handleRequestJoin} disabled={isPending || joinRequested}
                  className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-xl border border-brand-500/30 text-brand-400 hover:bg-brand-500/10 transition-all disabled:opacity-50">
                  <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  {joinRequested ? 'Enviada' : 'Solicitar'}
                </button>
              )}
              {currentUserId && isMember && (
                <button onClick={toggleMute} title={muted ? 'Activar notificaciones' : 'Silenciar grupo'}
                  className="p-2 rounded-xl border border-white/10 text-text-muted hover:text-brand-400 hover:border-brand-500/30 transition-all">
                  {muted ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                </button>
              )}
              {currentUserId && isMember && !isCreator && (
                <button onClick={handleLeave} disabled={isPending}
                  className="flex items-center gap-1 px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-xl border border-white/10 text-text-muted hover:border-red-500/30 hover:text-red-400 transition-all">
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              )}
              {isAdmin && (
                <button onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-xl border border-brand-500/30 text-brand-400 hover:bg-brand-500/10 transition-all">
                  <Settings className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Gestionar</span>
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-xl font-black text-text-primary">{group.name}</h1>
            {group.isPrivate
              ? <span className="flex items-center gap-1 text-[10px] font-bold bg-white/5 text-text-muted px-2 py-0.5 rounded-full"><Lock className="w-3 h-3" /> Privado</span>
              : <span className="flex items-center gap-1 text-[10px] font-bold bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded-full"><Globe className="w-3 h-3" /> Público</span>
            }
            {muted && <span className="flex items-center gap-1 text-[10px] font-bold bg-white/5 text-text-muted px-2 py-0.5 rounded-full"><BellOff className="w-3 h-3" /> Silenciado</span>}
          </div>
          {group.description && <p className="text-sm text-text-secondary mb-3 leading-relaxed">{group.description}</p>}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {group._count.members} miembros</span>
            <span className="hidden sm:inline">·</span>
            <span className="flex items-center gap-1">Creado por
              <Link href={`/profile/${group.creator.username}`} className="flex items-center gap-1 text-brand-400 hover:underline ml-1">
                <Crown className="w-3 h-3" /> {group.creator.name ?? group.creator.username}
              </Link>
            </span>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 p-1 bg-surface rounded-xl border border-surface-border">
        {(['feed', 'members', ...(isAdmin && group.isPrivate ? ['requests'] : [])] as const).map((t: any) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('flex-1 py-2 text-sm font-bold rounded-lg transition-all',
              tab === t ? 'bg-surface-hover text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'
            )}>
            {t === 'feed' ? `📝 Feed (${group._count.posts})`
              : t === 'members' ? `👥 Miembros (${group._count.members})`
              : `🔔 Solicitudes`}
          </button>
        ))}
      </div>

      {/* ── FEED TAB ── */}
      {tab === 'feed' && (
        <div className="space-y-4">
          {isMember && currentUserId && (
            <div className="card p-4">
              <textarea value={postContent} onChange={e => setPostContent(e.target.value)}
                placeholder={`Escribe algo en ${group.name}...`}
                className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted resize-none outline-none min-h-[80px]" />
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-border">
                <span className="text-[11px] text-text-muted flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" /> Auto-actualización cada 8s
                </span>
                <button onClick={handlePost} disabled={!postContent.trim() || isPending}
                  className="btn-primary px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-40">
                  <Send className="w-4 h-4" /> Publicar
                </button>
              </div>
            </div>
          )}

          {group.posts.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-text-muted text-sm">Sin publicaciones todavía. ¡Sé el primero!</p>
            </div>
          ) : group.posts.map((post: any) => (
            <div key={post.id} className="card p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-3">
                <Link href={`/profile/${post.author.username}`}>
                  <img src={post.author.image ?? getAvatarUrl(post.author.username)} alt=""
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-white/10 object-cover" />
                </Link>
                <div className="flex-1">
                  <Link href={`/profile/${post.author.username}`}
                    className="text-sm font-bold text-text-primary hover:text-brand-400 transition-colors">
                    {post.author.name ?? post.author.username}
                  </Link>
                  <p className="text-[11px] text-text-muted">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: es })}
                  </p>
                </div>
                {group.members.find((m: any) => m.userId === post.author.id)?.role === 'ADMIN' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full">
                    <Crown className="w-3 h-3" /> Admin
                  </span>
                )}
              </div>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{post.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── MEMBERS TAB ── */}
      {tab === 'members' && (
        <div className="card divide-y divide-surface-border overflow-hidden">
          {group.members.map((m: any) => (
            <div key={m.userId} className="flex items-center gap-3 px-3 sm:px-5 py-3 hover:bg-white/[0.02] transition-colors">
              <Link href={`/profile/${m.user.username}`}>
                <img src={m.user.image ?? getAvatarUrl(m.user.username)} alt=""
                  className="w-10 h-10 rounded-full border border-white/10 object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/profile/${m.user.username}`}
                  className="text-sm font-bold text-text-primary hover:text-brand-400 transition-colors">
                  {m.user.name ?? m.user.username}
                </Link>
                <p className="text-[11px] text-text-muted">@{m.user.username}</p>
              </div>
              <div className="flex items-center gap-2">
                {m.role === 'ADMIN' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full">
                    <Crown className="w-3 h-3" />
                    {group.creatorId === m.userId ? 'Creador' : 'Admin'}
                  </span>
                )}
                {isAdmin && m.userId !== currentUserId && m.userId !== group.creatorId && (
                  <button onClick={() => handleKick(m.userId, m.user.name ?? m.user.username)}
                    className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="Expulsar">
                    <UserMinus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── REQUESTS TAB (solo admin de grupo privado) ── */}
      {tab === 'requests' && isAdmin && (
        <RequestsTab groupId={group.id} onRespond={handleRespondRequest} />
      )}

      {showEditModal && isAdmin && (
        <EditGroupModal group={group} onClose={() => setShowEditModal(false)} onDelete={handleDelete} isPending={isPending}
          onUpdate={(data) => setGroup((prev: any) => ({ ...prev, ...data }))}
          onGenerateInviteLink={handleGenerateInviteLink}
          inviteLink={inviteLink}
        />
      )}
    </div>
  )
}

// ── Tab de solicitudes de acceso ─────────────────────────────────────────────
function RequestsTab({ groupId, onRespond }: { groupId: string; onRespond: (id: string, accept: boolean) => void }) {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    fetch(`/api/groups/${groupId}/requests`)
      .then(r => r.json())
      .then(d => { setRequests(d.requests ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [groupId])

  if (loading) return <div className="card p-8 text-center text-text-muted text-sm">Cargando...</div>
  if (requests.length === 0) return (
    <div className="card p-12 text-center">
      <ClipboardCheck className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-30" />
      <p className="text-text-muted text-sm">No hay solicitudes pendientes</p>
    </div>
  )

  return (
    <div className="card divide-y divide-surface-border overflow-hidden">
      {requests.map((req: any) => (
        <div key={req.id} className="flex items-center gap-3 px-5 py-3">
          <img src={req.user?.image ?? getAvatarUrl(req.user?.username)} alt=""
            className="w-10 h-10 rounded-full border border-white/10 object-cover" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-text-primary truncate">{req.user?.name ?? req.user?.username}</p>
            <p className="text-[11px] text-text-muted">@{req.user?.username}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { onRespond(req.id, true); setRequests(prev => prev.filter(r => r.id !== req.id)) }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-xl bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 transition-all">
              <UserCheck className="w-3.5 h-3.5" /> Aceptar
            </button>
            <button onClick={() => { onRespond(req.id, false); setRequests(prev => prev.filter(r => r.id !== req.id)) }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
              <UserX className="w-3.5 h-3.5" /> Rechazar
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Modal de gestión del grupo (admin) ───────────────────────────────────────
function EditGroupModal({ group, onClose, onDelete, isPending, onUpdate, onGenerateInviteLink, inviteLink }: {
  group: any; onClose: () => void; onDelete: () => void; isPending: boolean
  onUpdate?: (data: Partial<any>) => void
  onGenerateInviteLink?: () => void
  inviteLink?: string | null
}) {
  const [activeTab, setActiveTab]     = useState<'info' | 'appearance' | 'invite'>('info')
  const [name, setName]               = useState(group.name)
  const [description, setDescription] = useState(group.description ?? '')
  const [isPrivate, setIsPrivate]     = useState(group.isPrivate)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl]     = useState(group.image ?? '')
  const [saving, startSave]           = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return toast.error('Máx 5MB')
    const reader = new FileReader()
    reader.onload = ev => setAvatarUrl(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSave = () => startSave(async () => {
    try {
      const bannerValue = selectedColor
        ? `color:${selectedColor.split('→')[0].trim()}:${selectedColor.split('→')[1].trim()}`
        : undefined
      const updateData = {
        name, description, isPrivate,
        image: avatarUrl || undefined,
        ...(bannerValue ? { banner: bannerValue } : {}),
      }
      await updateGroup(group.id, updateData)

      // Optimistic update — refleja el cambio en el padre sin recargar
      group.name        = name
      group.description = description
      group.isPrivate   = isPrivate
      if (avatarUrl)    group.image  = avatarUrl
      if (bannerValue)  group.banner = bannerValue

      toast.success('Grupo actualizado ✓')
      onClose()
      // Forzar re-render del padre notificando el nuevo estado
      onUpdate?.({ name, description, isPrivate,
        image: avatarUrl || group.image,
        banner: bannerValue || group.banner,
      })
    } catch (e: any) { toast.error(e.message) }
  })

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="card w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand-400" /> Gestionar grupo
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5">×</button>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-1 p-2 border-b border-surface-border bg-surface-hover">
          {(['info', 'appearance', ...(group.isPrivate ? ['invite'] : [])] as const).map((t: any) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={cn('flex-1 py-1.5 text-xs font-bold rounded-lg transition-all capitalize',
                activeTab === t ? 'bg-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'
              )}>
              {t === 'info' ? '📋 Información' : t === 'appearance' ? '🎨 Apariencia' : '🔗 Invitaciones'}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* ── TAB INFO ── */}
          {activeTab === 'info' && (
            <>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">Nombre</label>
                <input value={name} onChange={e => setName(e.target.value)} className="input text-sm" maxLength={50} />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">Descripción</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  className="input text-sm h-24 resize-none" maxLength={500} />
                <p className="text-[10px] text-text-muted mt-1 text-right">{description.length}/500</p>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-hover">
                <div>
                  <p className="text-sm font-semibold text-text-primary">Grupo privado</p>
                  <p className="text-[11px] text-text-muted">Solo miembros pueden ver el contenido</p>
                </div>
                <button onClick={() => setIsPrivate(!isPrivate)}
                  className={cn('relative w-11 h-6 rounded-full transition-colors inline-flex items-center', isPrivate ? 'bg-brand-500' : 'bg-white/10')}>
                  <span className={cn('inline-block w-4 h-4 bg-white rounded-full shadow transition-transform', isPrivate ? 'translate-x-6' : 'translate-x-1')} />
                </button>
              </div>
            </>
          )}

          {/* ── TAB APARIENCIA ── */}
          {activeTab === 'appearance' && (
            <>
              {/* Avatar del grupo */}
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-3 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" /> Foto del grupo
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl border-2 border-surface-border overflow-hidden bg-surface-hover flex items-center justify-center shrink-0">
                    {avatarUrl
                      ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                      : <Users className="w-7 h-7 text-text-muted" />
                    }
                  </div>
                  <div className="space-y-2">
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />
                    <button onClick={() => fileRef.current?.click()}
                      className="flex items-center gap-2 px-3 py-2 text-xs rounded-xl border border-dashed border-white/20 hover:border-brand-500/50 text-text-muted hover:text-text-primary transition-all">
                      <Upload className="w-3.5 h-3.5" /> Subir imagen
                    </button>
                    <input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)}
                      placeholder="O pega una URL..." className="input text-xs py-2" />
                  </div>
                </div>
              </div>

              {/* Color del banner */}
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-3 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5" /> Color del banner
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {GROUP_COLORS.map(c => {
                    const val = `${c.from}→${c.to}`
                    return (
                      <button key={c.label} onClick={() => setSelectedColor(selectedColor === val ? null : val)}
                        className={cn('relative h-12 rounded-xl overflow-hidden border-2 transition-all',
                          selectedColor === val ? 'border-white scale-95' : 'border-transparent hover:scale-95'
                        )}
                        style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
                        title={c.label}>
                        {selectedColor === val && (
                          <CheckCircle className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow" />
                        )}
                      </button>
                    )
                  })}
                </div>
                <p className="text-[11px] text-text-muted mt-2">
                  {selectedColor ? `Color seleccionado: ${GROUP_COLORS.find(c => `${c.from}→${c.to}` === selectedColor)?.label}` : 'Ningún color seleccionado (se mantiene el actual)'}
                </p>
              </div>
            </>
          )}

          {/* ── TAB INVITACIONES ── */}
          {activeTab === 'invite' && (
            <div className="space-y-4">
              <p className="text-sm text-text-secondary">Genera un enlace para que otros puedan unirse directamente sin solicitar acceso. El enlace expira en 7 días.</p>
              <button onClick={onGenerateInviteLink} disabled={isPending}
                className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-sm disabled:opacity-40">
                <Link2 className="w-4 h-4" /> Generar nuevo enlace
              </button>
              {inviteLink && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 bg-surface-hover rounded-xl border border-brand-500/20">
                    <code className="text-xs text-brand-400 flex-1 truncate">{inviteLink}</code>
                    <button onClick={() => { navigator.clipboard.writeText(inviteLink); toast.success('Copiado') }}
                      className="shrink-0 p-1.5 hover:bg-brand-500/10 rounded-lg transition-all">
                      <Copy className="w-3.5 h-3.5 text-brand-400" />
                    </button>
                  </div>
                  <p className="text-[11px] text-text-muted">Comparte este enlace con quien quieras invitar al grupo</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-surface-border">
          <button onClick={onDelete} disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
            <Trash2 className="w-4 h-4" /> Eliminar grupo
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-secondary px-4 py-2 text-sm">Cancelar</button>
            <button onClick={handleSave} disabled={saving || !name.trim()}
              className="btn-primary px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-40">
              <CheckCircle className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
