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
