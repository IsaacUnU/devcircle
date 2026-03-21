import { db } from '@/lib/db'

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  const result = await db.group.deleteMany({
    where: {
      autoDeleteAt: {
        not: null,
        lte: now,
      },
    },
  })

  return Response.json({ deleted: result.count, timestamp: now.toISOString() })
}
