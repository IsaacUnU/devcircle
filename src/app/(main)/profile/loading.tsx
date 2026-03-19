import { ProfileSkeleton, FeedSkeleton } from '@/components/ui/Skeletons'

export default function ProfileLoading() {
  return (
    <div className="max-w-2xl lg:max-w-3xl xl:max-w-2xl mx-auto py-6 px-4 space-y-6">
      <ProfileSkeleton />
      <FeedSkeleton count={3} />
    </div>
  )
}
