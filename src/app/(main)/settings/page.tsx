import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { Settings } from 'lucide-react'
import { SettingsLayout } from '@/components/settings/SettingsLayout'
import { getPendingFollowRequests } from '@/lib/actions/privacy'
import { DEFAULT_PRIVACY, type PrivacySettings } from '@/lib/privacy'

export const metadata: Metadata = { title: 'Ajustes · Devora' }

export default async function SettingsPage() {
    const session = await auth()
    if (!session?.user?.id) redirect('/auth/login')

    const [user, pendingRequests] = await Promise.all([
        db.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true, username: true, name: true, email: true,
                bio: true, website: true, location: true, image: true,
                notifPrefs: true, privacySettings: true,
                accounts: { select: { type: true } },
            },
        }),
        getPendingFollowRequests(),
    ])

    if (!user) redirect('/auth/login')

    const isOAuth = !user.accounts.some(a => a.type === 'credentials')
    const privacySettings: PrivacySettings = {
        ...DEFAULT_PRIVACY,
        ...((user.privacySettings as Partial<PrivacySettings>) ?? {}),
    }

    return (
        <main className="flex-1 max-w-2xl lg:max-w-3xl xl:max-w-2xl px-4 sm:px-6 py-4 sm:py-6 border-x border-surface-border min-h-screen">
            <div className="flex items-center gap-3 mb-8">
                <Settings className="w-6 h-6 text-brand-400" />
                <div>
                    <h1 className="text-xl font-bold text-text-primary">Ajustes</h1>
                    <p className="text-xs text-text-muted">@{user.username}</p>
                </div>
            </div>
            <SettingsLayout
                user={{
                    id: user.id, username: user.username, name: user.name,
                    email: user.email, bio: user.bio, website: user.website,
                    location: user.location, image: user.image, isOAuth,
                    notifPrefs: (user.notifPrefs as Record<string, boolean>) ?? {},
                    privacySettings,
                }}
                pendingRequests={pendingRequests}
            />
        </main>
    )
}
