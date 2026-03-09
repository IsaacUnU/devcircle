'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { createProjectSchema, CreateProject } from '@/lib/validations'
import { updateReputation } from './reputation'

export async function createProject(data: CreateProject) {
    const session = await auth()
    if (!session?.user?.id) throw new Error('No autenticado')

    const parsed = createProjectSchema.safeParse(data)
    if (!parsed.success) throw new Error(parsed.error.errors[0].message)

    const project = await db.project.create({
        data: {
            ...parsed.data,
            ownerId: session.user.id,
        },
    })

    // Reputation: +10 for sharing a project
    await updateReputation(session.user.id, 10)

    revalidatePath('/projects')
    return project
}
