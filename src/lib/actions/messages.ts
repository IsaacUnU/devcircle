'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { isSpam } from '@/lib/content-moderation'

export async function createOrGetConversation(otherUserId: string): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const userId = session.user.id

  // Check if conversation already exists (either direction)
  const existing = await db.conversation.findFirst({
    where: {
      OR: [
        { userAId: userId, userBId: otherUserId },
        { userAId: otherUserId, userBId: userId },
      ],
    },
  })

  if (existing) return existing.id

  // Determine status: if otherUser follows current user, it's ACTIVE. Else REQUEST.
  const follows = await db.follow.findUnique({
    where: { followerId_followingId: { followerId: otherUserId, followingId: userId } }
  })

  // Create new conversation
  const conv = await db.conversation.create({
    data: {
      userAId: userId,
      userBId: otherUserId,
      status: follows ? 'ACTIVE' : 'REQUEST',
    },
  })

  return conv.id
}

export async function sendMessage({
  conversationId,
  receiverId,
  content = '',
  mediaUrl,
  mediaType
}: {
  conversationId: string
  receiverId: string
  content?: string
  mediaUrl?: string
  mediaType?: 'image' | 'audio'
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  if (!content.trim() && !mediaUrl) throw new Error('Mensaje vacío')

  // Verify user belongs to this conversation
  const conversation = await db.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [
        { userAId: session.user.id },
        { userBId: session.user.id },
      ],
    },
    include: {
      messages: { orderBy: { createdAt: 'asc' }, take: 1 } // first message to determine initiator
    }
  })

  if (!conversation) throw new Error('Conversación no encontrada')

  let newStatus = conversation.status
  let isMessageSpam = false

  if (isSpam(content)) {
    newStatus = 'SPAM'
    isMessageSpam = true
  } else if (conversation.status === 'REQUEST' && conversation.messages.length > 0) {
     const initiator = conversation.messages[0].senderId
     if (session.user.id !== initiator) {
       // Si el receptor responde al request, se vuelve ACTIVE
       newStatus = 'ACTIVE'
     }
  }

  const isRequest = newStatus === 'REQUEST'

  const [message] = await Promise.all([
    db.directMessage.create({
      data: {
        content: content.trim(),
        senderId: session.user.id,
        receiverId,
        conversationId,
        isRequest,
        isSpam: isMessageSpam,
        mediaUrl,
        mediaType
      },
    }),
    db.conversation.update({
      where: { id: conversationId },
      data: { 
        lastMsgAt: new Date(),
        status: newStatus
      },
    }),
  ])

  revalidatePath(`/messages/${conversationId}`)
  return message
}

export async function markConversationAsRead(conversationId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  await db.directMessage.updateMany({
    where: {
      conversationId,
      receiverId: session.user.id,
      read: false,
    },
    data: { read: true },
  })

  revalidatePath('/messages')
}

export async function getConversationMessages(conversationId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  return db.directMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: { select: { id: true, username: true, name: true, image: true } }, // Rechequeo forzado TS
    },
  })
}
