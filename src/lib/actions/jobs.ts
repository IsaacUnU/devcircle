'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { createJobSchema, CreateJob } from '@/lib/validations'

export async function createJob(data: CreateJob) {
    const session = await auth()
    if (!session?.user?.id) throw new Error('No autenticado')

    const parsed = createJobSchema.safeParse(data)
    if (!parsed.success) throw new Error(parsed.error.errors[0].message)

    const job = await db.job.create({
        data: {
            ...parsed.data,
            authorId: session.user.id,
        },
    })

    revalidatePath('/jobs')
    return job
}

export async function updateJob(jobId: string, data: CreateJob) {
    const session = await auth()
    if (!session?.user?.id) throw new Error('No autenticado')

    const existing = await db.job.findUnique({ where: { id: jobId } })
    if (!existing) throw new Error('Empleo no encontrado')
    if (existing.authorId !== session.user.id) throw new Error('Sin permiso')

    const parsed = createJobSchema.safeParse(data)
    if (!parsed.success) throw new Error(parsed.error.errors[0].message)

    const job = await db.job.update({
        where: { id: jobId },
        data: parsed.data,
    })

    revalidatePath('/jobs')
    return job
}

export async function deleteJob(jobId: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error('No autenticado')

    const existing = await db.job.findUnique({ where: { id: jobId } })
    if (!existing) throw new Error('Empleo no encontrado')
    if (existing.authorId !== session.user.id && session.user.role !== 'ADMIN')
        throw new Error('Sin permiso')

    await db.job.delete({ where: { id: jobId } })
    revalidatePath('/jobs')
}
