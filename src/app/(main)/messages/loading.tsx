import { ConversationSkeleton } from '@/components/ui/Skeletons'

export default function MessagesLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Lista de conversaciones */}
      <div className="w-80 border-r border-surface-2 flex-shrink-0">
        <div className="p-4 border-b border-surface-2">
          <div className="h-9 bg-surface-2 animate-pulse rounded-xl" />
        </div>
        <ConversationSkeleton count={6} />
      </div>
      {/* Panel derecho vacío */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3 opacity-30">
          <div className="w-16 h-16 rounded-full bg-surface-2 animate-pulse mx-auto" />
          <div className="h-4 w-32 bg-surface-2 animate-pulse rounded-md mx-auto" />
        </div>
      </div>
    </div>
  )
}
