import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ notifications: [] })

  const notifications = await db.notification.findMany({
    where: { receiverId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      trigger: { select: { id: true, username: true, name: true, image: true } },
    },
  })

  // Para las FOLLOW_REQUEST, buscamos el id real del FollowRequest
  // así el cliente puede aceptar/rechazar directamente desde la notificación
  const enriched = await Promise.all(
    notifications.map(async n => {
      if (n.type !== 'FOLLOW_REQUEST') return { ...n, followRequestId: null }

      const req = await db.followRequest.findUnique({
        where: { senderId_receiverId: { senderId: n.triggeredBy, receiverId: n.receiverId } },
        select: { id: true, status: true },
      })

      return {
        ...n,
        followRequestId: req?.status === 'PENDING' ? req.id : null,
      }
    })
  )

  return NextResponse.json({ notifications: enriched })
}

export async function PATCH() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ ok: false })

  await db.notification.updateMany({
    where: { receiverId: session.user.id, read: false },
    data: { read: true },
  })

  return NextResponse.json({ ok: true })
}
