import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'

// ── GET: obtener eventos próximos ─────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await auth()
  const { searchParams } = new URL(req.url)

  // location: 1) query param, 2) perfil del usuario, 3) sin filtro
  let locationFilter = searchParams.get('location') ?? ''

  if (!locationFilter && session?.user?.id) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { location: true },
    })
    locationFilter = user?.location ?? ''
  }

  const city = locationFilter.split(',')[0].trim()
  const now = new Date()

  const events = await db.event.findMany({
    where: {
      startsAt: { gte: now },
      ...(city ? {
        OR: [
          { location: { contains: city, mode: 'insensitive' } },
          { online: true },
        ],
      } : {}),
    },
    orderBy: { startsAt: 'asc' },
    take: 6,
    include: {
      author: { select: { username: true, name: true, image: true } },
    },
  })

  return NextResponse.json({ events, location: city })
}

// ── POST: crear evento (solo usuarios verificados) ────────────────────────────
const CreateEventSchema = z.object({
  title:       z.string().min(5).max(100),
  description: z.string().max(500).optional(),
  url:         z.string().url().optional().or(z.literal('')),
  location:    z.string().min(2).max(100),
  country:     z.string().length(2).optional(),
  type:        z.enum(['HACKATHON', 'CONFERENCIA', 'MEETUP', 'WORKSHOP', 'WEBINAR', 'OTRO']),
  startsAt:    z.string().datetime(),
  endsAt:      z.string().datetime().optional(),
  online:      z.boolean().default(false),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  // Verificar que el usuario está verificado
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { verified: true, role: true },
  })

  if (!user?.verified && user?.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Necesitas ser usuario verificado para crear eventos.' },
      { status: 403 }
    )
  }

  const body = await req.json()
  const parsed = CreateEventSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { url, endsAt, ...rest } = parsed.data

  const event = await db.event.create({
    data: {
      ...rest,
      url: url || null,
      endsAt: endsAt ? new Date(endsAt) : null,
      startsAt: new Date(rest.startsAt),
      authorId: session.user.id,
    },
  })

  return NextResponse.json({ event }, { status: 201 })
}
