import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ requests: [] })

  // Solo el admin del grupo puede ver las solicitudes
  const member = await db.groupMember.findUnique({
    where: { groupId_userId: { groupId: params.id, userId: session.user.id } },
  })
  if (!member || member.role !== 'ADMIN') return NextResponse.json({ requests: [] })

  const requests = await db.groupInvite.findMany({
    where: { groupId: params.id, status: 'PENDING', userId: { not: null } },
    include: { user: { select: { id: true, username: true, name: true, image: true } } },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json({ requests })
}
