'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Home, Search, Bell, Bookmark, User, Settings,
  PlusCircle, Code2, LogOut, Play, MessageSquare,
  Users, Briefcase
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/lib/store'
import { signOut } from 'next-auth/react'
import { getAvatarUrl } from '@/lib/utils'

const navItems = [
  { href: '/feed', label: 'Feed', icon: Home },
  { href: '/search', label: 'Explorar', icon: Search },
  { href: '/clips', label: 'DevClips', icon: Play },
  { href: '/projects', label: 'Proyectos', icon: Code2 },
  { href: '/jobs', label: 'Empleos', icon: Briefcase },
  { href: '/groups', label: 'Grupos', icon: Users },
  { href: '/notifications', label: 'Notificaciones', icon: Bell },
  { href: '/messages', label: 'Mensajes', icon: MessageSquare },
  { href: '/bookmarks', label: 'Guardados', icon: Bookmark },
  { href: '/settings', label: 'Ajustes', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { openCompose, unreadCount } = useUIStore()

  return (
    <aside className="sticky top-0 h-screen w-64 hidden lg:flex flex-col border-r border-surface-border bg-surface px-4 py-8 z-40 glass shrink-0">
      {/* Logo */}
      <Link href="/feed" className="flex items-center gap-3 px-4 mb-10 group">
        <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20 group-hover:scale-105 transition-transform duration-200">
          <Code2 className="w-6 h-6 text-brand-400" />
        </div>
        <span className="text-xl font-extrabold tracking-tight text-text-primary bg-clip-text">DevCircle</span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-1.5 px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          const showBadge = href === '/notifications' && unreadCount > 0

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative',
                active
                  ? 'bg-brand-500/10 text-brand-400 shadow-sm'
                  : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
              )}
            >
              <div className="relative">
                <Icon className={cn('w-5 h-5 transition-transform duration-200 group-hover:scale-110', active ? 'text-brand-400' : 'text-text-secondary group-hover:text-text-primary')} />
                {showBadge && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-500 rounded-full border-2 border-surface shadow-lg" />
                )}
              </div>
              {label}
              {active && (
                <div className="absolute left-0 w-1 h-5 bg-brand-500 rounded-full shadow-[0_0_12px_rgba(34,197,94,0.5)]" />
              )}
              {showBadge && (
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
          className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-gradient-to-br from-brand-500 to-brand-600 hover:brightness-110 text-white rounded-xl font-bold text-sm transition-all duration-200 shadow-xl shadow-brand-500/20 mb-6 group active:scale-95"
        >
          <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          Nuevo Post
        </button>

        {/* User */}
        {session?.user && (
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3 group">
            <Link href={`/profile/${session.user.username}`} className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={session.user.image ?? getAvatarUrl(session.user.username)}
                  alt=""
                  className="w-10 h-10 rounded-full border border-white/10 ring-2 ring-transparent group-hover:ring-brand-500/30 transition-all shadow-lg"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-brand-500 rounded-full border-2 border-[#161b22] shadow-sm" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-text-primary truncate">
                  {session.user.name ?? session.user.username}
                </p>
                <p className="text-[11px] text-text-secondary truncate mt-0.5">@{session.user.username}</p>
              </div>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/auth/login' })}
              className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

