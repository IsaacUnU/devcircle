import { auth } from '@/lib/auth'
import { getEvents } from '@/lib/queries'
import { Suspense } from 'react'
import { RightSidebarServer } from '@/components/layout/RightSidebarServer'
import { Calendar } from 'lucide-react'
import type { Metadata } from 'next'
import { EventCard } from '@/components/events/EventCard'
import { EventsHeader } from '@/components/events/EventsHeader'
import { EventFilters } from '@/components/events/EventFilters'

import { db } from '@/lib/db'

export const metadata: Metadata = {
    title: 'Eventos',
    description: 'Descubre y participa en eventos creados por Developers Verificados.',
}

export default async function EventsPage({ 
    searchParams 
}: { 
    searchParams: { type?: string, search?: string } 
}) {
    const session = await auth()
    const type = searchParams.type || 'all'
    const search = searchParams.search || ''

    const [events, currentUser] = await Promise.all([
        getEvents({ type, search }),
        session?.user?.id ? db.user.findUnique({ where: { id: session.user.id }, select: { role: true } }) : Promise.resolve(null)
    ])

    return (
        <div className="flex w-full justify-center xl:justify-start">
            <main className="flex-1 max-w-2xl lg:max-w-3xl xl:max-w-2xl px-4 sm:px-6 py-4 sm:py-8 border-x border-white/5 min-h-screen">
                <EventsHeader showCreateButton={currentUser?.role === 'DEVELOPER'} />
                
                <EventFilters />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-children">
                    {events.length > 0 ? (
                        events.map(event => (
                            <EventCard key={event.id} event={event} />
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <div className="w-16 h-16 bg-surface-hover rounded-3xl flex items-center justify-center mx-auto mb-4 border border-surface-border">
                                <Calendar className="w-8 h-8 text-text-muted" />
                            </div>
                            <p className="text-text-primary font-bold">No se encontraron eventos</p>
                            <p className="text-text-muted text-sm mt-1">Prueba a cambiar los filtros o busca otra palabra.</p>
                        </div>
                    )}
                </div>
            </main>

            <Suspense fallback={<div className="w-[350px] hidden xl:block p-8" />}>
                <RightSidebarServer />
            </Suspense>
        </div>
    )
}
