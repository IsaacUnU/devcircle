import { Sidebar } from '@/components/layout/Sidebar'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { ComposeModal } from '@/components/post/ComposeModal'
import { NotificationPoller } from '@/components/providers/NotificationPoller'
import { ProjectModal } from '@/components/projects/ProjectModal'
import { JobModal } from '@/components/jobs/JobModal'
import { GroupModal } from '@/components/groups/GroupModal'

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen justify-center bg-surface">
            <NotificationPoller />
            <div className="flex w-full max-w-[1300px]">
                <Sidebar />
                <ComposeModal />
                <ProjectModal />
                <JobModal />
                <GroupModal />
                <div className="flex-1 flex flex-col min-w-0">
                    {children}
                </div>
            </div>
            {/* Bottom nav visible solo en móvil (oculto en lg+) */}
            <MobileBottomNav />
        </div>
    )
}
