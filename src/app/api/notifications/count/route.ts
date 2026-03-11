import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// Query ultra ligera — solo cuenta filas, no carga datos
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ count: 0 })

  const count = await db.notification.count({
    where: { receiverId: session.user.id, read: false },
  })

  return NextResponse.json({ count })
}
