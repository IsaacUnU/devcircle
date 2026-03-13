import { FeedSkeleton } from '@/components/ui/Skeletons'

export default function BookmarksLoading() {
  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="h-8 w-40 bg-surface-2 animate-pulse rounded-md mb-6" />
      <FeedSkeleton count={4} />
    </div>
  )
}
