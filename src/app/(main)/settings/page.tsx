import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { Settings } from 'lucide-react'
import { SettingsLayout } from '@/components/settings/SettingsLayout'

export const metadata: Metadata = { title: 'Ajustes · DevCircle' }

export default async function SettingsPage() {
    const session = await auth()
    if (!session?.user?.id) redirect('/auth/login')

    // Cargar datos completos del usuario desde la BD
    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            username: true,
            name: true,
            email: true,
            bio: true,
            website: true,
            location: true,
            image: true,
            notifPrefs: true,
            accounts: { select: { type: true } },
        },
    })

    if (!user) redirect('/auth/login')

    // Es OAuth si NO tiene cuenta credentials
    const isOAuth = !user.accounts.some(a => a.type === 'credentials')

    const userProps = {
        id:          user.id,
        username:    user.username,
        name:        user.name,
        email:       user.email,
        bio:         user.bio,
        website:     user.website,
        location:    user.location,
        image:       user.image,
        isOAuth,
        notifPrefs:  (user.notifPrefs as Record<string, boolean>) ?? {},
    }

    return (
        <main className="flex-1 max-w-4xl px-6 py-6 border-x border-surface-border min-h-screen">
            <div className="flex items-center gap-3 mb-8">
                <Settings className="w-6 h-6 text-brand-400" />
                <div>
                    <h1 className="text-xl font-bold text-text-primary">Ajustes</h1>
                    <p className="text-xs text-text-muted">@{user.username}</p>
                </div>
            </div>
            <SettingsLayout user={userProps} />
        </main>
    )
}
