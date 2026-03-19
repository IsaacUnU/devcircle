import { Sidebar } from '@/components/layout/Sidebar'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { ComposeModal } from '@/components/post/ComposeModal'
import { NotificationPoller } from '@/components/providers/NotificationPoller'
import { ProjectModal } from '@/components/projects/ProjectModal'
import { JobModal } from '@/components/jobs/JobModal'
import { GroupModal } from '@/components/groups/GroupModal'
import { EventModal } from '@/components/events/EventModal'
import { PageTransition } from '@/components/ui/PageTransition'

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen justify-center bg-surface">
            <NotificationPoller />
            <div className="flex w-full max-w-[1300px] pb-16 lg:pb-0">
                <Sidebar />
                <ComposeModal />
                <ProjectModal />
                <JobModal />
                <GroupModal />
                <EventModal />
                <PageTransition>
                    {children}
                </PageTransition>
            </div>
            {/* Bottom nav visible solo en móvil (oculto en lg+) */}
            <MobileBottomNav />
        </div>
    )
}
