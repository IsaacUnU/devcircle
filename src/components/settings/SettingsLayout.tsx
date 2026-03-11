'use client'

import { useState } from 'react'
import { User, Shield, Bell, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProfileTab }       from './tabs/ProfileTab'
import { SecurityTab }      from './tabs/SecurityTab'
import { NotificationsTab } from './tabs/NotificationsTab'
import { AppearanceTab }    from './tabs/AppearanceTab'

type Tab = 'profile' | 'security' | 'notifications' | 'appearance'

const TABS = [
  { id: 'profile'       as Tab, label: 'Perfil',            icon: User    },
  { id: 'security'      as Tab, label: 'Cuenta y Seguridad', icon: Shield  },
  { id: 'notifications' as Tab, label: 'Notificaciones',    icon: Bell    },
  { id: 'appearance'    as Tab, label: 'Apariencia',        icon: Palette },
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
  }
}

export function SettingsLayout({ user }: SettingsLayoutProps) {
  const [activeTab, setActiveTab] = useState<Tab>('profile')

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Sidebar de navegación */}
      <nav className="space-y-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-brand-500/10 text-brand-400 font-semibold'
                : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
            )}
          >
            <tab.icon className="w-4 h-4 shrink-0" />
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Contenido del tab activo */}
      <div className="md:col-span-2">
        {activeTab === 'profile' && <ProfileTab user={user} />}
        {activeTab === 'security' && <SecurityTab isOAuth={user.isOAuth} email={user.email} />}
        {activeTab === 'notifications' && <NotificationsTab initialPrefs={user.notifPrefs} />}
        {activeTab === 'appearance' && <AppearanceTab />}
      </div>
    </div>
  )
}
