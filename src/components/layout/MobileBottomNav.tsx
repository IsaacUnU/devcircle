'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Home, Search, Bell, Bookmark, Settings,
  PlusCircle, MessageSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/lib/store'

// Items mostrados en el Bottom Nav móvil (los 5 más importantes)
const mobileNavItems = [
  { href: '/feed', label: 'Feed', icon: Home },
  { href: '/search', label: 'Explorar', icon: Search },
  { href: '/notifications', label: 'Alertas', icon: Bell, badge: true },
  { href: '/messages', label: 'Mensajes', icon: MessageSquare },
  { href: '/settings', label: 'Ajustes', icon: Settings },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const { unreadCount, openCompose } = useUIStore()

  return (
    <>
      {/* Barra inferior fija */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-surface/95 backdrop-blur-md border-t border-surface-border safe-area-pb">
        <div className="flex items-center justify-around px-2 py-2">
          {mobileNavItems.map(({ href, label, icon: Icon, badge }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[3rem]',
                  isActive
                    ? 'text-brand-400'
                    : 'text-text-muted hover:text-text-secondary'
                )}
              >
                <div className="relative">
                  <Icon className={cn('w-5 h-5', isActive && 'drop-shadow-[0_0_6px_rgba(139,92,246,0.6)]')} />
                  {badge && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-brand-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className={cn(
                  'text-[10px] font-medium',
                  isActive ? 'text-brand-400' : 'text-text-muted'
                )}>
                  {label}
                </span>
                {/* Indicador activo */}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-400" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* FAB — botón flotante para crear post en móvil */}
      <button
        onClick={openCompose}
        className="fixed bottom-20 right-4 z-50 lg:hidden w-12 h-12 rounded-full bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/30 flex items-center justify-center transition-all duration-200 active:scale-95"
        aria-label="Crear post"
      >
        <PlusCircle className="w-6 h-6" />
      </button>

      {/* Spacer para que el contenido no quede tapado por la barra */}
      <div className="h-16 lg:hidden" />
    </>
  )
}
