import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import { ConversationList } from '@/components/messages/ConversationList'
import { ChatWindow } from '@/components/messages/ChatWindow'
import { MessageSquare } from 'lucide-react'

export default async function ConversationPage({ params }: { params: { id: string } }) {
    const session = await auth()
    if (!session?.user?.id) redirect('/auth/login')

    const { id } = await params

    // Fetch all conversations for the sidebar
    const [conversations, currentConv] = await Promise.all([
        db.conversation.findMany({
            where: {
                OR: [{ userAId: session.user.id }, { userBId: session.user.id }],
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
        }),
        db.conversation.findUnique({
            where: { id },
            include: {
                userA: { select: { id: true, username: true, name: true, image: true } },
                userB: { select: { id: true, username: true, name: true, image: true } },
                messages: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        sender: { select: { id: true, username: true, name: true, image: true } },
                    },
                },
            },
        })
    ])

    if (!currentConv) notFound()

    // Security check: user must be part of the conversation
    if (currentConv.userAId !== session.user.id && currentConv.userBId !== session.user.id) {
        redirect('/messages')
    }

    const otherUser = currentConv.userAId === session.user.id ? currentConv.userB : currentConv.userA

    return (
        <div className="flex-1 flex h-screen overflow-hidden">
            {/* Sidebar: conversation list (hidden on small screens if ID active) */}
            <div className="hidden md:flex w-80 border-r border-surface-border flex-col shrink-0">
                <div className="flex items-center gap-3 p-4 border-b border-surface-border">
                    <MessageSquare className="w-5 h-5 text-brand-400" />
                    <h1 className="font-bold text-text-primary text-lg">Mensajes</h1>
                </div>
                <ConversationList
                    conversations={conversations as any}
                    currentUserId={session.user.id}
                    activeId={id}
                />
            </div>

            {/* Chat Window */}
            <ChatWindow
                conversation={currentConv as any}
                currentUserId={session.user.id}
                otherUser={otherUser as any}
            />
        </div>
    )
}
