'use server'

import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const eventSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres").max(100),
  description: z.string().max(2000).optional(),
  url: z.string().url("Debe ser una URL válida").optional().or(z.literal('')),
  location: z.string().min(2, "Ubicación requerida"),
  type: z.enum(['HACKATHON', 'CONFERENCIA', 'MEETUP', 'WORKSHOP', 'WEBINAR', 'OTRO']),
  startsAt: z.string().or(z.date()),
  online: z.boolean().default(false),
})

export async function createEvent(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error('No autorizado')
  }

  // Fetch the latest user data from the DB to bypass stale session tokens
  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  const isVerifiedDeveloper = currentUser?.role === 'DEVELOPER'
  
  if (!isVerifiedDeveloper && currentUser?.role !== 'ADMIN') {
    throw new Error('Solo los Developers Verificados pueden crear eventos')
  }

  const data = Object.fromEntries(formData.entries())
  
  const parsed = eventSchema.safeParse({
    ...data,
    online: data.online === 'true',
  })

  if (!parsed.success) {
    throw new Error(parsed.error.errors[0].message)
  }

  const event = await db.event.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      url: parsed.data.url || null,
      location: parsed.data.location,
      type: parsed.data.type,
      startsAt: new Date(parsed.data.startsAt),
      online: parsed.data.online,
      authorId: session.user.id,
    },
  })

  revalidatePath('/events')
  return { success: true, event }
}
