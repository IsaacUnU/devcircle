'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import {
  Home, Search, Bell, Bookmark, Settings,
  PlusCircle, Code2, LogOut, MessageSquare,
  Users, Briefcase
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/lib/store'
import { signOut } from 'next-auth/react'
import { getAvatarUrl } from '@/lib/utils'

const navItems = [
  { href: '/feed', label: 'Feed', icon: Home },
  { href: '/search', label: 'Explorar', icon: Search },
  { href: '/projects', label: 'Proyectos', icon: Code2 },
  { href: '/jobs', label: 'Empleos', icon: Briefcase },
  { href: '/groups', label: 'Grupos', icon: Users },
  { href: '/notifications', label: 'Notificaciones', icon: Bell },
  { href: '/messages', label: 'Mensajes', icon: MessageSquare },
  { href: '/bookmarks', label: 'Guardados', icon: Bookmark },
  { href: '/settings', label: 'Ajustes', icon: Settings },
]

export function Sidebar() {
  const { resolvedTheme } = useTheme()
  const pathname = usePathname()
  const { data: session } = useSession()
  const { openCompose, unreadCount, sidebarStyle } = useUIStore()
  // Imagen fresca desde BD (el JWT puede estar desactualizado tras cambiar avatar)
  const [freshAvatar, setFreshAvatar] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.user?.id) return
    fetch('/api/user/avatar')
      .then(r => r.json())
      .then(d => { if (d.image) setFreshAvatar(d.image) })
      .catch(() => { })
  }, [session?.user?.id])

  const avatarSrc = freshAvatar ?? session?.user?.image ?? getAvatarUrl(session?.user?.username ?? '')

  const isCompact = sidebarStyle === 'compact'
  const isFloating = sidebarStyle === 'floating'

  const logoSrc = isCompact
    ? "/web-app-manifest-192x192.png"
    : (resolvedTheme === 'light' ? "/logo-devora-blanco.png" : "/logo-devora.png")

  return (
    <aside className={cn(
      "sticky top-0 h-screen hidden lg:flex flex-col border-r border-surface-border bg-surface z-40 glass shrink-0 transition-all duration-300",
      sidebarStyle === 'full' && "w-64 px-4 py-8",
      sidebarStyle === 'compact' && "w-20 px-2 py-8",
      sidebarStyle === 'floating' && "w-64 m-4 h-[calc(100vh-2rem)] rounded-3xl border shadow-2xl py-8 px-4"
    )}>
      <div className={cn("absolute top-0 left-1/2 -translate-x-1/2 z-10 transition-all duration-300", isCompact ? "mt-4" : "mt-0")}>
        <Link href="/feed" className="block group">
          <div className={cn("flex items-center justify-center transition-all duration-300 group-hover:scale-110", isCompact ? "w-12 h-12" : "w-48 h-48")}>
            <img
              src={logoSrc}
              alt="Devora"
              className={cn("w-full h-full object-contain", !isCompact && "drop-shadow-[0_4px_12px_rgba(74,222,128,0.5)]")}
            />
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className={cn("flex-1 space-y-1.5 mt-36 transition-all duration-300", isCompact ? "px-1" : "px-2")}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
            || pathname.startsWith(href + '/')
            || (href === '/feed' && (pathname.startsWith('/post/') || pathname.startsWith('/profile/')))
          const showBadge = href === '/notifications' && unreadCount > 0

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center rounded-xl text-sm font-semibold transition-all duration-200 group relative',
                isCompact ? 'justify-center p-3' : 'gap-4 px-4 py-3',
                active
                  ? 'bg-brand-500/10 text-brand-400 shadow-sm'
                  : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
              )}
              title={isCompact ? label : undefined}
            >
              <div className="relative">
                <Icon className={cn('transition-transform duration-200 group-hover:scale-110', isCompact ? 'w-6 h-6' : 'w-5 h-5', active ? 'text-brand-400' : 'text-text-secondary group-hover:text-text-primary')} />
                {showBadge && (
                  <span className={cn("absolute bg-brand-500 rounded-full border-2 border-surface shadow-lg", isCompact ? "-top-1 -right-1 w-2.5 h-2.5" : "-top-1 -right-1 w-2.5 h-2.5")} />
                )}
              </div>
              {!isCompact && label}
              {active && (
                <div className={cn("absolute left-0 bg-brand-500 rounded-full shadow-[0_0_12px_rgba(34,197,94,0.5)]", isCompact ? "w-0.5 h-6" : "w-1 h-5")} />
              )}
              {showBadge && !isCompact && (
                <span className="ml-auto text-[10px] bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full border border-brand-500/30">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="px-2 mt-4">
        {/* Compose button */}
        <button
          onClick={openCompose}
          className={cn(
            "flex items-center justify-center bg-gradient-to-br from-brand-500 to-brand-600 hover:brightness-110 text-white rounded-xl font-bold text-sm transition-all duration-200 shadow-xl shadow-brand-500/20 mb-6 group active:scale-95",
            isCompact ? "p-3 w-12 h-12 mx-auto" : "gap-2 w-full py-3.5 px-4"
          )}
          title={isCompact ? "Nuevo Post" : undefined}
        >
          <PlusCircle className={cn("transition-transform duration-300 group-hover:rotate-90", isCompact ? "w-6 h-6" : "w-5 h-5")} />
          {!isCompact && "Nuevo Post"}
        </button>

        {/* User */}
        {session?.user && (
          <div className={cn(
            "rounded-2xl bg-white/5 border border-white/5 flex items-center group transition-all duration-300",
            isCompact ? "p-1 justify-center" : "p-3 gap-3"
          )}>
            <Link href={`/profile/${session.user.username}`} className={cn("flex items-center flex-1 min-w-0", isCompact ? "justify-center" : "gap-3")}>
              <div className="relative shrink-0">
                <img
                  src={avatarSrc}
                  alt=""
                  className={cn("rounded-full border border-white/10 ring-2 ring-transparent group-hover:ring-brand-500/30 transition-all shadow-lg object-cover", isCompact ? "w-8 h-8" : "w-10 h-10")}
                />
                {!isCompact && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-brand-500 rounded-full border-2 border-[#161b22] shadow-sm" />
                )}
              </div>
              {!isCompact && (
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text-primary truncate">
                    {session.user.name ?? session.user.username}
                  </p>
                  <p className="text-[11px] text-text-secondary truncate mt-0.5">@{session.user.username}</p>
                </div>
              )}
            </Link>
            {!isCompact && (
              <button
                onClick={() => signOut({ callbackUrl: '/auth/login' })}
                className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}

