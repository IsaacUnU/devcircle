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

  return NextResponse.json({ notifications })
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
