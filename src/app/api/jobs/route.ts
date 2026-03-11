import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/jobs — lista con búsqueda y filtros
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl
        const q        = searchParams.get('q')        ?? ''
        const type     = searchParams.get('type')     ?? ''
        const location = searchParams.get('location') ?? ''

        const where: any = {}

        if (q) {
            where.OR = [
                { title:       { contains: q, mode: 'insensitive' } },
                { company:     { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
            ]
        }
        if (type)     where.type     = type
        if (location) where.location = { contains: location, mode: 'insensitive' }

        const [jobs, total] = await Promise.all([
            db.job.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                include: {
                    author: { select: { id: true, username: true, name: true, image: true } },
                },
            }),
            db.job.count({ where }),
        ])

        return NextResponse.json({ jobs, total })
    } catch (error) {
        console.error('[GET /api/jobs]', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
