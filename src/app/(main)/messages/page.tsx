import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { MessageSquare } from 'lucide-react'
import { ConversationList } from '@/components/messages/ConversationList'

export const metadata: Metadata = { title: 'Mensajes · DevCircle' }

export default async function MessagesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/login')

  const conversations = await db.conversation.findMany({
    where: {
      OR: [
        { userAId: session.user.id },
        { userBId: session.user.id },
      ],
    },
    orderBy: { lastMsgAt: 'desc' },
    include: {
      userA: { select: { id: true, username: true, name: true, image: true } },
      userB: { select: { id: true, username: true, name: true, image: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { content: true, createdAt: true, read: true, senderId: true },
      },
    },
  })

  return (
    <div className="flex-1 flex h-screen overflow-hidden">
      {/* Sidebar: conversation list */}
      <div className="w-full md:w-80 border-r border-surface-border flex flex-col shrink-0">
        <div className="flex items-center gap-3 p-4 border-b border-surface-border">
          <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
            <MessageSquare className="w-4 h-4 text-brand-400" />
          </div>
          <h1 className="font-bold text-text-primary text-lg">Mensajes</h1>
        </div>
        <ConversationList
          conversations={conversations as any}
          currentUserId={session.user.id}
        />
      </div>

      {/* Empty state */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-[#0a0a0a]/50 p-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-surface-hover flex items-center justify-center border border-surface-border mb-6 animate-pulse">
          <MessageSquare className="w-10 h-10 text-brand-400 opacity-50" />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Tus mensajes</h2>
        <p className="text-text-secondary text-sm max-w-xs mb-8">
          Selecciona una conversación para leer los mensajes o empieza una nueva desde el perfil de un desarrollador.
        </p>
      </div>
    </div>
  )
}
