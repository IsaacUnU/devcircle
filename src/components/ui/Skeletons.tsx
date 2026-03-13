// Componente base para efectos skeleton
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-surface-2 ${className}`}
    />
  )
}

// ── Post Card Skeleton ────────────────────────────────────────────────────────
export function PostCardSkeleton() {
  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-4 pt-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  )
}

// ── Feed Skeleton (lista de posts) ────────────────────────────────────────────
export function FeedSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  )
}

// ── Profile Header Skeleton ───────────────────────────────────────────────────
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Banner */}
      <Skeleton className="w-full h-40 rounded-xl" />
      {/* Avatar + info */}
      <div className="flex items-end gap-4 -mt-12 px-4">
        <Skeleton className="w-24 h-24 rounded-full ring-4 ring-surface" />
        <div className="flex-1 space-y-2 pb-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
      {/* Bio */}
      <div className="px-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      {/* Stats */}
      <div className="flex gap-6 px-4">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  )
}

// ── Sidebar Skeleton ──────────────────────────────────────────────────────────
export function SidebarUserSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3">
      <Skeleton className="w-9 h-9 rounded-full" />
      <div className="space-y-1.5 flex-1">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}

// ── Right Sidebar Skeleton ────────────────────────────────────────────────────
export function RightSidebarSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-5 w-32 mb-3" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Notifications Skeleton ────────────────────────────────────────────────────
export function NotificationSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="divide-y divide-surface-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-4">
          <Skeleton className="w-10 h-10 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Message List Skeleton ─────────────────────────────────────────────────────
export function ConversationSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-1 p-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
          <Skeleton className="w-11 h-11 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Jobs List Skeleton ────────────────────────────────────────────────────────
export function JobCardSkeleton() {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  )
}

export function JobsListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </div>
  )
}
