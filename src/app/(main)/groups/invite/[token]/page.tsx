import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import { JoinViaInviteClient } from '@/components/groups/JoinViaInviteClient'

interface Props { params: { token: string } }

export default async function InvitePage({ params }: Props) {
  const session = await auth()

  const invite = await db.groupInvite.findUnique({
    where: { token: params.token },
    include: {
      group: {
        include: {
          creator: { select: { username: true, name: true } },
          _count: { select: { members: true } },
        },
      },
    },
  })

  if (!invite) notFound()
  if (invite.expiresAt && invite.expiresAt < new Date()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card p-10 text-center max-w-sm">
          <p className="text-xl font-bold text-text-primary mb-2">Enlace expirado</p>
          <p className="text-text-muted text-sm">Este enlace de invitación ya no es válido.</p>
        </div>
      </div>
    )
  }

  // Si ya es miembro, redirigir directamente al grupo
  if (session?.user?.id) {
    const member = await db.groupMember.findUnique({
      where: { groupId_userId: { groupId: invite.groupId, userId: session.user.id } },
    })
    if (member) redirect(`/groups/${invite.groupId}`)
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <JoinViaInviteClient
        token={params.token}
        group={invite.group as any}
        isLoggedIn={!!session?.user?.id}
      />
    </div>
  )
}
