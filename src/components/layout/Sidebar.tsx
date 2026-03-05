'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  Home, Search, Bell, Bookmark, User, Settings, 
  PlusCircle, Code2, LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/lib/store'
import { signOut } from 'next-auth/react'

const navItems = [
  { href: '/feed',      label: 'Feed',        icon: Home },
  { href: '/search',    label: 'Explorar',    icon: Search },
  { href: '/notifications', label: 'Notificaciones', icon: Bell },
  { href: '/bookmarks', label: 'Guardados',   icon: Bookmark },
  { href: '/settings',  label: 'Ajustes',     icon: Settings },
]

export function Sidebar() {
  const pathname   = usePathname()
  const { data: session } = useSession()
  const { openCompose, unreadCount } = useUIStore()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col border-r border-surface-border bg-surface px-4 py-6 z-40">
      {/* Logo */}
      <Link href="/feed" className="flex items-center gap-2 px-3 mb-8 group">
        <Code2 className="w-7 h-7 text-brand-500 group-hover:text-brand-400 transition-colors" />
        <span className="text-xl font-bold tracking-tight text-text-primary">DevCircle</span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          const showBadge = href === '/notifications' && unreadCount > 0

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-brand-500/10 text-brand-400'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
              )}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {showBadge && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-500 rounded-full" />
                )}
              </div>
              {label}
              {showBadge && (
                <span className="ml-auto text-xs bg-brand-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Compose button */}
      <button
        onClick={openCompose}
        className="btn-primary flex items-center justify-center gap-2 w-full mb-4"
      >
        <PlusCircle className="w-4 h-4" />
        Nuevo post
      </button>

      {/* User profile */}
      {session?.user && (
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors group">
          <Link href={`/profile/${session.user.username}`} className="flex items-center gap-3 flex-1 min-w-0">
            {session.user.image ? (
              <img src={session.user.image} alt="" className="w-8 h-8 avatar" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand-900 flex items-center justify-center text-brand-400 text-sm font-bold">
                {session.user.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{session.user.name}</p>
              <p className="text-xs text-text-muted truncate">@{session.user.username}</p>
            </div>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-text-secondary transition-all"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  )
}
