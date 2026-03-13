'use client'

import { useState } from 'react'
import { User, Shield, Bell, Palette, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProfileTab }       from './tabs/ProfileTab'
import { SecurityTab }      from './tabs/SecurityTab'
import { NotificationsTab } from './tabs/NotificationsTab'
import { AppearanceTab }    from './tabs/AppearanceTab'
import { PrivacyTab }       from './tabs/PrivacyTab'
import type { PrivacySettings } from '@/lib/privacy'

type Tab = 'profile' | 'security' | 'notifications' | 'appearance' | 'privacy'

const TABS = [
  { id: 'profile'       as Tab, label: 'Perfil',            icon: User    },
  { id: 'security'      as Tab, label: 'Cuenta y Seguridad', icon: Shield  },
  { id: 'notifications' as Tab, label: 'Notificaciones',    icon: Bell    },
  { id: 'appearance'    as Tab, label: 'Apariencia',        icon: Palette },
  { id: 'privacy'       as Tab, label: 'Privacidad',        icon: Lock    },
]

interface SettingsLayoutProps {
  user: {
    id: string
    name?: string | null
    bio?: string | null
    website?: string | null
    location?: string | null
    image?: string | null
    username: string
    email: string
    isOAuth: boolean
    notifPrefs: Record<string, boolean>
    privacySettings: PrivacySettings
  }
  pendingRequests: {
    id: string
    sender: { id: string; username: string; name: string | null; image: string | null; bio: string | null }
    createdAt: Date
  }[]
}

export function SettingsLayout({ user, pendingRequests }: SettingsLayoutProps) {
  const [activeTab, setActiveTab] = useState<Tab>('profile')

  return (
    <div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-6">
      {/* Nav de tabs — scroll horizontal en móvil, vertical en desktop */}
      <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-1 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl text-sm font-medium transition-all shrink-0 md:shrink md:w-full',
              activeTab === tab.id
                ? 'bg-brand-500/10 text-brand-400 font-semibold'
                : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
            )}
          >
            <tab.icon className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">{tab.label}</span>
            {tab.id === 'privacy' && pendingRequests.length > 0 && (
              <span className="ml-auto bg-brand-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                {pendingRequests.length}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Contenido del tab activo */}
      <div className="md:col-span-2">
        {activeTab === 'profile'        && <ProfileTab user={user} />}
        {activeTab === 'security'       && <SecurityTab isOAuth={user.isOAuth} email={user.email} />}
        {activeTab === 'notifications'  && <NotificationsTab initialPrefs={user.notifPrefs} />}
        {activeTab === 'appearance'     && <AppearanceTab />}
        {activeTab === 'privacy'        && (
          <PrivacyTab
            initialSettings={user.privacySettings}
            pendingRequests={pendingRequests}
          />
        )}
      </div>
    </div>
  )
}
