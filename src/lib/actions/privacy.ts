'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { PrivacySettings } from '@/lib/privacy'

// ── Guardar configuración de privacidad ──────────────────────────────────────

export async function updatePrivacySettings(settings: PrivacySettings) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  await db.user.update({
    where: { id: session.user.id },
    data: { privacySettings: settings as any },
  })

  revalidatePath('/settings')
  revalidatePath(`/profile/${(session.user as any).username}`)
}

// ── Solicitar seguir (perfil privado) ────────────────────────────────────────

export async function sendFollowRequest(targetUserId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')
  if (session.user.id === targetUserId) throw new Error('No puedes seguirte a ti mismo')

  const existing = await db.followRequest.findUnique({
    where: { senderId_receiverId: { senderId: session.user.id, receiverId: targetUserId } },
  })

  if (existing) {
    if (existing.status === 'PENDING') throw new Error('Ya tienes una solicitud pendiente')
    await db.followRequest.update({
      where: { id: existing.id },
      data: { status: 'PENDING', createdAt: new Date() },
    })
    return { requested: true }
  }

  await db.followRequest.create({
    data: { senderId: session.user.id, receiverId: targetUserId },
  })

  // Notificación de SOLICITUD — upsert para evitar duplicados
  await db.notification.upsert({
    where: {
      // clave única: mismo tipo + mismo trigger + mismo receiver
      type_triggeredBy_receiverId: {
        type: 'FOLLOW_REQUEST',
        triggeredBy: session.user.id,
        receiverId: targetUserId,
      },
    },
    update: { read: false, createdAt: new Date() }, // refrescar si ya existía
    create: {
      type: 'FOLLOW_REQUEST',
      receiverId: targetUserId,
      triggeredBy: session.user.id,
    },
  })

  revalidatePath('/profile')
  return { requested: true }
}

// ── Cancelar solicitud de follow ─────────────────────────────────────────────

export async function cancelFollowRequest(targetUserId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  await db.followRequest.deleteMany({
    where: { senderId: session.user.id, receiverId: targetUserId, status: 'PENDING' },
  })

  revalidatePath('/profile')
  return { requested: false }
}

// ── Aceptar / Rechazar solicitud ─────────────────────────────────────────────

export async function respondFollowRequest(requestId: string, action: 'accept' | 'reject') {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const request = await db.followRequest.findUnique({ where: { id: requestId } })
  if (!request || request.receiverId !== session.user.id) throw new Error('Solicitud no encontrada')

  if (action === 'accept') {
    await db.follow.upsert({
      where: { followerId_followingId: { followerId: request.senderId, followingId: session.user.id } },
      update: {},
      create: { followerId: request.senderId, followingId: session.user.id },
    })
    await db.followRequest.update({ where: { id: requestId }, data: { status: 'ACCEPTED' } })

    // Notificar al que envió la solicitud que fue aceptada
    try {
      await db.notification.upsert({
        where: {
          type_triggeredBy_receiverId: {
            type: 'FOLLOW_ACCEPTED',
            triggeredBy: session.user.id,
            receiverId: request.senderId,
          }
        },
        create: {
          type: 'FOLLOW_ACCEPTED',
          receiverId: request.senderId,
          triggeredBy: session.user.id,
        },
        update: {
          read: false,
          createdAt: new Date(),
        }
      })
    } catch (e) {
      console.warn('Duplicate notification ignored:', e)
    }
  } else {
    await db.followRequest.update({ where: { id: requestId }, data: { status: 'REJECTED' } })
  }

  revalidatePath('/notifications')
  revalidatePath('/settings')
}

// ── Obtener solicitudes pendientes recibidas ─────────────────────────────────

export async function getPendingFollowRequests() {
  const session = await auth()
  if (!session?.user?.id) return []

  return db.followRequest.findMany({
    where: { receiverId: session.user.id, status: 'PENDING' },
    include: {
      sender: {
        select: { id: true, username: true, name: true, image: true, bio: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}
