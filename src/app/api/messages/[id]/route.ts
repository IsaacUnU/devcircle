import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) return new NextResponse('No autenticado', { status: 401 })

  const { id } = await params

  // Verify membership
  const conversation = await db.conversation.findFirst({
    where: {
      id,
      OR: [{ userAId: session.user.id }, { userBId: session.user.id }]
    }
  })

  if (!conversation) return new NextResponse('No encontrado', { status: 404 })

  const messages = await db.directMessage.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: { select: { id: true, username: true, name: true, image: true } }
    }
  })

  return NextResponse.json(messages)
}
