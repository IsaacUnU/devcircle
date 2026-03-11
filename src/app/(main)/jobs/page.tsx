import { auth } from '@/lib/auth'
import { getJobs, getSuggestedUsers, getTrendingTags, getTopContributors } from '@/lib/queries'
import { RightSidebar } from '@/components/layout/RightSidebar'
import { JobHeader } from '@/components/jobs/JobHeader'
import { JobsList } from '@/components/jobs/JobsList'

export default async function JobsPage() {
    const [session, jobs, suggested, trending, topDevs] = await Promise.all([
        auth(),
        getJobs(),
        getSuggestedUsers(),
        getTrendingTags(),
        getTopContributors(),
    ])

    return (
        <div className="flex w-full justify-center xl:justify-start">
            <main className="flex-1 max-w-2xl px-6 py-8 border-x border-white/5 min-h-screen">
                <JobHeader />
                <JobsList initialJobs={jobs as any} currentUserId={session?.user?.id} />
            </main>
            <RightSidebar suggestedUsers={suggested} trendingTags={trending} topDevs={topDevs} />
        </div>
    )
}
