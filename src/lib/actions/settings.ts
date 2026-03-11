'use server'

import { revalidatePath } from 'next/cache'
import { auth, signOut } from '@/lib/auth'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// ── Cambiar contraseña ────────────────────────────────────────────────────────
const changePasswordSchema = z.object({
  current:  z.string().min(1, 'Introduce tu contraseña actual'),
  next:     z.string().min(8, 'Mínimo 8 caracteres'),
  confirm:  z.string(),
}).refine(d => d.next === d.confirm, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm'],
})

export async function changePassword(data: unknown) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const parsed = changePasswordSchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.errors[0].message)

  const account = await db.account.findFirst({
    where: { userId: session.user.id, type: 'credentials' },
  })
  if (!account?.access_token) throw new Error('Esta cuenta usa OAuth. No puedes cambiar la contraseña aquí.')

  const valid = await bcrypt.compare(parsed.data.current, account.access_token)
  if (!valid) throw new Error('La contraseña actual es incorrecta')

  const hashed = await bcrypt.hash(parsed.data.next, 12)
  await db.account.update({
    where: { id: account.id },
    data: { access_token: hashed },
  })
}

// ── Cambiar email ─────────────────────────────────────────────────────────────
const changeEmailSchema = z.object({
  email:    z.string().email('Email inválido'),
  password: z.string().min(1, 'Introduce tu contraseña para confirmar'),
})

export async function changeEmail(data: unknown) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const parsed = changeEmailSchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.errors[0].message)

  const account = await db.account.findFirst({
    where: { userId: session.user.id, type: 'credentials' },
  })
  if (!account?.access_token) throw new Error('Esta cuenta usa OAuth.')

  const valid = await bcrypt.compare(parsed.data.password, account.access_token)
  if (!valid) throw new Error('Contraseña incorrecta')

  const exists = await db.user.findUnique({ where: { email: parsed.data.email } })
  if (exists) throw new Error('Ese email ya está en uso')

  await db.user.update({
    where: { id: session.user.id },
    data: { email: parsed.data.email },
  })

  // Actualizar también el providerAccountId del account credentials
  await db.account.update({
    where: { id: account.id },
    data: { providerAccountId: parsed.data.email },
  })

  revalidatePath('/settings')
}

// ── Cerrar sesión en todos los dispositivos ───────────────────────────────────
export async function revokeAllSessions() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  // Eliminar todas las sesiones de BD (NextAuth JWT no tiene sesiones en BD,
  // pero eliminamos las de OAuth si las hay)
  await db.session.deleteMany({ where: { userId: session.user.id } })
}

// ── Eliminar cuenta ───────────────────────────────────────────────────────────
export async function deleteAccount(password: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const account = await db.account.findFirst({
    where: { userId: session.user.id, type: 'credentials' },
  })

  // Solo pedir contraseña si es cuenta credentials
  if (account?.access_token) {
    const valid = await bcrypt.compare(password, account.access_token)
    if (!valid) throw new Error('Contraseña incorrecta')
  }

  // Cascade elimina posts, likes, follows, etc. (definido en schema)
  await db.user.delete({ where: { id: session.user.id } })
}

// ── Actualizar preferencias de notificaciones ─────────────────────────────────
export async function updateNotificationPrefs(prefs: Record<string, boolean>) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  // Guardamos como JSON en un campo notifPrefs del User
  // Si el campo no existe aún, lo guardamos de otra forma temporal
  await db.user.update({
    where: { id: session.user.id },
    data: { notifPrefs: prefs },
  })

  revalidatePath('/settings')
}

// ── Actualizar foto de perfil (solo URL externa) ──────────────────────────────
// NOTA: Base64 desactivado — rompe cookies JWT (error 431). Pendiente Supabase Storage.
export async function updateAvatar(imageUrl: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  if (!imageUrl.startsWith('http')) throw new Error('Solo se admiten URLs externas por ahora')

  await db.user.update({
    where: { id: session.user.id },
    data: { image: imageUrl },
  })

  revalidatePath('/profile')
  revalidatePath('/settings')
}
