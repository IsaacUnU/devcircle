'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import {
  Home, Search, Bell, Bookmark, Settings,
  PlusCircle, Code2, LogOut, MessageSquare,
  Users, Briefcase, X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/lib/store'
import { signOut } from 'next-auth/react'
import { getAvatarUrl } from '@/lib/utils'
import { useTranslation, Locale } from '@/lib/i18n'

const getNavItems = (t: Record<string, string>) => [
  { href: '/feed', label: t.home, icon: Home },
  { href: '/search', label: t.explore, icon: Search },
  { href: '/projects', label: t.projects || 'Projects', icon: Code2 },
  { href: '/jobs', label: t.jobs, icon: Briefcase },
  { href: '/groups', label: t.groups || 'Groups', icon: Users },
  { href: '/notifications', label: t.notifications, icon: Bell },
  { href: '/messages', label: t.messages, icon: MessageSquare },
  { href: '/bookmarks', label: t.bookmarks, icon: Bookmark },
  { href: '/settings', label: t.settings, icon: Settings },
]

export function Sidebar() {
  const { resolvedTheme } = useTheme()
  const pathname = usePathname()
  const { data: session } = useSession()
  const { openCompose, unreadCount, sidebarStyle, isMobileSidebarOpen, setMobileSidebarOpen } = useUIStore()
  const { dict } = useTranslation()
  const t = dict.sidebar
  const navItems = getNavItems(t as Record<string, string>)

  // Imagen fresca desde BD (el JWT puede estar desactualizado tras cambiar avatar)
  const [freshAvatar, setFreshAvatar] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isLaptop, setIsLaptop] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
      setIsLaptop(window.innerWidth >= 1024 && window.innerWidth < 1280)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!session?.user?.id) return
    fetch('/api/user/avatar')
      .then(r => r.json())
      .then(d => { if (d.image) setFreshAvatar(d.image) })
      .catch(() => { })
  }, [session?.user?.id])

  const avatarSrc = freshAvatar ?? session?.user?.image ?? getAvatarUrl(session?.user?.username ?? '')

  // Auto-compact if strictly on a small laptop screen unless it's floating
  const effectiveStyle = (sidebarStyle === 'full' && isLaptop) ? 'compact' : sidebarStyle
  
  const isCompact = !isMobile && effectiveStyle === 'compact'
  const isFloating = !isMobile && effectiveStyle === 'floating'

  const logoSrc = isCompact
    ? (resolvedTheme === 'light' ? "/favicon-blanco.png" : "/favicon-negro.png")
    : (resolvedTheme === 'light' ? "/logo-devora-blanco.png" : "/logo-devora.png");

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-300",
          isMobileSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileSidebarOpen(false)}
      />

      <aside className={cn(
        "fixed lg:sticky top-0 left-0 h-[100dvh] lg:h-screen flex flex-col border-r border-surface-border bg-surface z-[80] lg:z-40 glass shrink-0 transition-all duration-300 shadow-2xl lg:shadow-none",
        isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        isMobile ? "pb-24" : "", // Espacio aumentado para que el bottom nav no tape el perfil
        (!isCompact && !isFloating) && "w-64 px-4 py-8",
        isCompact && "w-20 px-2 py-8",
        isFloating && "w-64 m-4 h-[calc(100vh-2rem)] rounded-3xl border shadow-2xl py-8 px-4"
      )}>
        {/* Mobile Close Button */}
        <button 
          onClick={() => setMobileSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-text-muted hover:text-white bg-white/5 rounded-full z-50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

      <div className={cn("absolute top-0 left-1/2 -translate-x-1/2 z-10 transition-all duration-300", isCompact ? "mt-4" : "mt-0")}>
        <Link href="/feed" className="block group" onClick={() => setMobileSidebarOpen(false)}>
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
      <nav className={cn(
        "flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar space-y-1.5 transition-all duration-300", 
        isMobile ? "mt-24" : "mt-36", // Menor margen en móviles para no empujar todo hacia abajo
        isCompact ? "px-1" : "px-2"
      )}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
            || pathname.startsWith(href + '/')
            || (href === '/feed' && (pathname.startsWith('/post/') || pathname.startsWith('/profile/')))
          const showBadge = href === '/notifications' && unreadCount > 0

          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileSidebarOpen(false)}
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

      <div className="px-2 mt-4 shrink-0 flex flex-col gap-2">
        {/* Compose button */}
        <button
          onClick={() => {
            openCompose();
            setMobileSidebarOpen(false);
          }}
          className={cn(
            "flex items-center justify-center bg-gradient-to-br from-brand-500 to-brand-600 hover:brightness-110 text-white rounded-xl font-bold text-sm transition-all duration-200 shadow-xl shadow-brand-500/20 mb-6 group active:scale-95",
            isCompact ? "p-3 w-12 h-12 mx-auto" : "gap-2 w-full py-3.5 px-4"
          )}
          title={isCompact ? t.new_post : undefined}
        >
          <PlusCircle className={cn("transition-transform duration-300 group-hover:rotate-90", isCompact ? "w-6 h-6" : "w-5 h-5")} />
          {!isCompact && t.new_post}
        </button>

        {/* User */}
        {session?.user && (
          <div className={cn(
            "rounded-2xl bg-white/5 border border-white/5 flex items-center group transition-all duration-300",
            isCompact ? "p-1 justify-center" : "p-3 gap-3"
          )}>
            <Link href={`/profile/${session.user.username}`} onClick={() => setMobileSidebarOpen(false)} className={cn("flex items-center flex-1 min-w-0", isCompact ? "justify-center" : "gap-3")}>
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
                className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all shrink-0"
                title={t.logout}
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
    </>
  )
}

