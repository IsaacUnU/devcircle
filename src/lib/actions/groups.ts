'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { canCreateGroup, type EligibilityResult } from '@/lib/group-utils'

export type { EligibilityResult }

export async function getGroupCreationEligibility(userId: string): Promise<EligibilityResult> {
  const user = await db.user.findUnique({ where: { id: userId }, select: { role: true, createdAt: true } })
  if (!user) throw new Error('Usuario no encontrado')
  return canCreateGroup(user)
}

const groupSchema = z.object({
  name:        z.string().min(3, 'Mínimo 3 caracteres').max(50),
  description: z.string().max(500).optional(),
  image:       z.string().optional(),
  banner:      z.string().optional(),
  isPrivate:   z.boolean().optional(),
})

// ── Crear grupo ───────────────────────────────────────────────────────────────
export async function createGroup(data: z.infer<typeof groupSchema>) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const parsed = groupSchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.errors[0].message)

  // Verificar nombre único
  const exists = await db.group.findUnique({ where: { name: parsed.data.name } })
  if (exists) throw new Error('Ya existe un grupo con ese nombre')

  // Verificar antigüedad de cuenta (min 30 días)
  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (!user) throw new Error('Usuario no encontrado')

  const eligibility = canCreateGroup(user)
  if (!eligibility.eligible) {
    throw new Error(`Debes tener al menos ${eligibility.daysRequired} días de antigüedad para crear un grupo (tienes ${eligibility.daysActive} días)`)
  }

  const isVerifiedGroup =
    user.role === 'ADMIN' ||
    (user.role === 'DEVELOPER' && user.verified === true)
  const autoDeleteAt = isVerifiedGroup ? null : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)

  const group = await db.group.create({
    data: {
      ...parsed.data,
      isVerified: isVerifiedGroup,
      creatorId: session.user.id,
      autoDeleteAt,
      members: {
        create: { userId: session.user.id, role: 'ADMIN' },
      },
    },
  })

  revalidatePath('/groups')
  return group
}

// ── Unirse a grupo ────────────────────────────────────────────────────────────
export async function joinGroup(groupId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const existing = await db.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: session.user.id } },
  })
  if (existing) throw new Error('Ya eres miembro de este grupo')

  await db.groupMember.create({
    data: { groupId, userId: session.user.id, role: 'MEMBER' },
  })

  await db.group.update({
    where: { id: groupId },
    data: { lastActivityAt: new Date(), autoDeleteAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
  })

  revalidatePath(`/groups/${groupId}`)
  revalidatePath('/groups')
}

// ── Salir de grupo ────────────────────────────────────────────────────────────
export async function leaveGroup(groupId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const group = await db.group.findUnique({ where: { id: groupId } })
  if (group?.creatorId === session.user.id) throw new Error('El creador no puede abandonar el grupo')

  await db.groupMember.delete({
    where: { groupId_userId: { groupId, userId: session.user.id } },
  })

  revalidatePath(`/groups/${groupId}`)
  revalidatePath('/groups')
}

// ── Actualizar grupo (solo creador/admin) ─────────────────────────────────────
export async function updateGroup(groupId: string, data: {
  name?: string; description?: string; image?: string; banner?: string; isPrivate?: boolean
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const member = await db.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: session.user.id } },
  })
  if (!member || member.role !== 'ADMIN') throw new Error('Sin permisos de administrador')

  if (data.name) {
    const exists = await db.group.findFirst({
      where: { name: data.name, NOT: { id: groupId } },
    })
    if (exists) throw new Error('Ese nombre ya está en uso')
  }

  const updated = await db.group.update({
    where: { id: groupId },
    data,
  })

  revalidatePath(`/groups/${groupId}`)
  revalidatePath('/groups')
  return updated
}

// ── Eliminar grupo (solo creador) ─────────────────────────────────────────────
export async function deleteGroup(groupId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const group = await db.group.findUnique({ where: { id: groupId } })
  if (!group) throw new Error('Grupo no encontrado')
  if (group.creatorId !== session.user.id) throw new Error('Solo el creador puede eliminar el grupo')

  await db.group.delete({ where: { id: groupId } })

  revalidatePath('/groups')
}

// ── Expulsar miembro (solo admin) ────────────────────────────────────────────
export async function kickMember(groupId: string, targetUserId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const me = await db.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: session.user.id } },
  })
  if (!me || me.role !== 'ADMIN') throw new Error('Sin permisos')

  const group = await db.group.findUnique({ where: { id: groupId } })
  if (group?.creatorId === targetUserId) throw new Error('No puedes expulsar al creador')

  await db.groupMember.delete({
    where: { groupId_userId: { groupId, userId: targetUserId } },
  })

  revalidatePath(`/groups/${groupId}`)
}

// ── Post en el grupo ──────────────────────────────────────────────────────────
export async function createGroupPost(groupId: string, content: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const member = await db.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: session.user.id } },
  })
  if (!member) throw new Error('Debes ser miembro para publicar')

  const post = await db.groupPost.create({
    data: { content, groupId, authorId: session.user.id },
    include: { author: { select: { id: true, username: true, name: true, image: true } } },
  })

  await db.group.update({
    where: { id: groupId },
    data: { lastActivityAt: new Date(), autoDeleteAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
  })

  revalidatePath(`/groups/${groupId}`)
  return post
}

// ── Solicitar unirse a grupo privado ─────────────────────────────────────────
export async function requestJoinGroup(groupId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const existing = await db.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: session.user.id } },
  })
  if (existing) throw new Error('Ya eres miembro')

  const pendingRequest = await db.groupInvite.findFirst({
    where: { groupId, userId: session.user.id, status: 'PENDING' },
  })
  if (pendingRequest) throw new Error('Ya tienes una solicitud pendiente')

  await db.groupInvite.create({
    data: { groupId, userId: session.user.id, status: 'PENDING' },
  })

  revalidatePath(`/groups/${groupId}`)
}

// ── Aceptar/rechazar solicitud (solo admin) ───────────────────────────────────
export async function respondToJoinRequest(inviteId: string, accept: boolean) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const invite = await db.groupInvite.findUnique({
    where: { id: inviteId },
    include: { group: true },
  })
  if (!invite) throw new Error('Solicitud no encontrada')

  const me = await db.groupMember.findUnique({
    where: { groupId_userId: { groupId: invite.groupId, userId: session.user.id } },
  })
  if (!me || me.role !== 'ADMIN') throw new Error('Sin permisos')

  if (accept && invite.userId) {
    await db.groupMember.create({
      data: { groupId: invite.groupId, userId: invite.userId, role: 'MEMBER' },
    })

    await db.group.update({
      where: { id: invite.groupId },
      data: { lastActivityAt: new Date() },
    })
  }

  await db.groupInvite.update({
    where: { id: inviteId },
    data: { status: accept ? 'ACCEPTED' : 'REJECTED' },
  })

  revalidatePath(`/groups/${invite.groupId}`)
}

// ── Generar enlace de invitación (solo admin) ────────────────────────────────
export async function generateInviteLink(groupId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const me = await db.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: session.user.id } },
  })
  if (!me || me.role !== 'ADMIN') throw new Error('Sin permisos')

  // Crear invite sin userId = enlace público de invitación
  const invite = await db.groupInvite.create({
    data: {
      groupId,
      userId: null,
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
    },
  })

  return invite.token
}

// ── Unirse via enlace de invitación ──────────────────────────────────────────
export async function joinViaInviteToken(token: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const invite = await db.groupInvite.findUnique({ where: { token } })
  if (!invite) throw new Error('Enlace inválido')
  if (invite.expiresAt && invite.expiresAt < new Date()) throw new Error('Enlace expirado')
  if (invite.userId !== null && invite.userId !== session.user.id) throw new Error('Enlace no válido para este usuario')

  const existing = await db.groupMember.findUnique({
    where: { groupId_userId: { groupId: invite.groupId, userId: session.user.id } },
  })
  if (existing) throw new Error('Ya eres miembro')

  await db.groupMember.create({
    data: { groupId: invite.groupId, userId: session.user.id, role: 'MEMBER' },
  })

  revalidatePath(`/groups/${invite.groupId}`)
  return invite.groupId
}

// ── Solicitar verificación de grupo ────────────────────────────────────────────────────────────────────────────
export async function requestGroupVerification(groupId: string): Promise<{ requested: boolean; reason?: string }> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const group = await db.group.findUnique({
    where: { id: groupId },
    include: { creator: { select: { id: true, role: true, verified: true } } },
  })
  if (!group) throw new Error('Grupo no encontrado')

  if (group.creatorId !== session.user.id) throw new Error('Solo el creador puede solicitar la verificación')

  if (group.isVerified) return { requested: false, reason: 'already_verified' }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, verified: true },
  })
  if (!user) throw new Error('Usuario no encontrado')

  const eligible =
    user.role === 'ADMIN' ||
    (user.role === 'DEVELOPER' && user.verified === true)

  if (!eligible) return { requested: false, reason: 'not_eligible' }

  const existingRequest = await db.groupInvite.findFirst({
    where: { groupId, userId: null, status: 'VERIFICATION_REQUEST' },
  })
  if (existingRequest) return { requested: true }

  await db.groupInvite.create({
    data: { groupId, userId: null, status: 'VERIFICATION_REQUEST' },
  })

  return { requested: true }
}

// ── Estado de verificación de grupo ────────────────────────────────────────────────────────────────────────────
export async function getGroupVerificationStatus(groupId: string) {
  const group = await db.group.findUnique({
    where: { id: groupId },
    select: { isVerified: true, creatorId: true, creator: { select: { role: true, verified: true } } },
  })
  if (!group) return null

  const creatorEligible =
    group.creator.role === 'ADMIN' ||
    (group.creator.role === 'DEVELOPER' && group.creator.verified)

  const pendingRequest = await db.groupInvite.findFirst({
    where: { groupId, userId: null, status: 'VERIFICATION_REQUEST' },
  })

  return {
    isVerified: group.isVerified,
    creatorEligible,
    hasPendingRequest: !!pendingRequest,
  }
}

// ── Otorgar verificación (solo admin de plataforma) ───────────────────────────────────────────────────────────────────────────
export async function grantGroupVerification(groupId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (!user || user.role !== 'ADMIN') throw new Error('Solo administradores pueden otorgar verificación')

  await db.groupInvite.deleteMany({
    where: { groupId, userId: null, status: 'VERIFICATION_REQUEST' },
  })

  const updated = await db.group.update({
    where: { id: groupId },
    data: { isVerified: true },
  })

  revalidatePath(`/groups/${groupId}`)
  revalidatePath('/groups')
  return updated
}

