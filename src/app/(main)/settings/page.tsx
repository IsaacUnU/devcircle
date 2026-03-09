import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Settings, User, Shield, Bell } from 'lucide-react'
import { SettingsForm } from '@/components/settings/SettingsForm'

export const metadata: Metadata = { title: 'Ajustes · DevCircle' }

export default async function SettingsPage() {
    const session = await auth()
    if (!session) redirect('/auth/login')

    return (
        <main className="flex-1 max-w-4xl px-6 py-6 border-x border-surface-border min-h-screen">
            <div className="flex items-center gap-3 mb-8">
                <Settings className="w-6 h-6 text-brand-400" />
                <h1 className="text-xl font-bold text-text-primary">Ajustes</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-500/10 text-brand-400 font-semibold text-sm">
                        <User className="w-4 h-4" /> Perfil
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors text-sm font-medium">
                        <Shield className="w-4 h-4" /> Cuenta y Seguridad
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors text-sm font-medium">
                        <Bell className="w-4 h-4" /> Notificaciones
                    </button>
                </div>

                <div className="md:col-span-2">
                    <SettingsForm user={session.user as any} />
                </div>
            </div>
        </main>
    )
}
