import { FeedSkeleton } from '@/components/ui/Skeletons'

export default function FeedLoading() {
  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <FeedSkeleton count={5} />
    </div>
  )
}
