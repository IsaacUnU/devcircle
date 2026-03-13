import { NotificationSkeleton } from '@/components/ui/Skeletons'

export default function NotificationsLoading() {
  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-surface-2">
          <div className="h-6 w-40 bg-surface-2 animate-pulse rounded-md" />
        </div>
        <NotificationSkeleton count={6} />
      </div>
    </div>
  )
}
