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

  // Recopilar todos los senderIds de FOLLOW_REQUEST en una sola query
  const followRequestSenderIds = notifications
    .filter(n => n.type === 'FOLLOW_REQUEST')
    .map(n => n.triggeredBy)

  // Una sola query en vez de N queries
  const pendingRequests = followRequestSenderIds.length > 0
    ? await db.followRequest.findMany({
        where: {
          senderId: { in: followRequestSenderIds },
          receiverId: session.user.id,
          status: 'PENDING',
        },
        select: { id: true, senderId: true },
      })
    : []

  // Mapa senderId → requestId para lookup O(1)
  const requestMap = new Map(pendingRequests.map(r => [r.senderId, r.id]))

  const enriched = notifications.map(n => ({
    ...n,
    followRequestId: n.type === 'FOLLOW_REQUEST'
      ? (requestMap.get(n.triggeredBy) ?? null)
      : null,
  }))

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
