import { JobsListSkeleton } from '@/components/ui/Skeletons'

export default function JobsLoading() {
  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <div className="h-8 w-48 bg-surface-2 animate-pulse rounded-md mb-6" />
      <JobsListSkeleton count={5} />
    </div>
  )
}
