'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

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

  // Create new conversation
  const conv = await db.conversation.create({
    data: {
      userAId: userId,
      userBId: otherUserId,
    },
  })

  return conv.id
}

export async function sendMessage({
  conversationId,
  receiverId,
  content,
}: {
  conversationId: string
  receiverId: string
  content: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  if (!content.trim()) throw new Error('Mensaje vacío')

  // Verify user belongs to this conversation
  const conversation = await db.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [
        { userAId: session.user.id },
        { userBId: session.user.id },
      ],
    },
  })

  if (!conversation) throw new Error('Conversación no encontrada')

  const [message] = await Promise.all([
    db.directMessage.create({
      data: {
        content: content.trim(),
        senderId: session.user.id,
        receiverId,
        conversationId,
      },
    }),
    db.conversation.update({
      where: { id: conversationId },
      data: { lastMsgAt: new Date() },
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
      sender: { select: { id: true, username: true, name: true, image: true } },
    },
  })
}
