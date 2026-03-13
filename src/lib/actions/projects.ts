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

export async function updateProject(projectId: string, data: CreateProject) {
    const session = await auth()
    if (!session?.user?.id) throw new Error('No autenticado')

    const existing = await db.project.findUnique({ where: { id: projectId } })
    if (!existing) throw new Error('Proyecto no encontrado')
    if (existing.ownerId !== session.user.id) throw new Error('Sin permiso')

    const parsed = createProjectSchema.safeParse(data)
    if (!parsed.success) throw new Error(parsed.error.errors[0].message)

    const project = await db.project.update({
        where: { id: projectId },
        data: parsed.data,
    })

    revalidatePath('/projects')
    return project
}

export async function deleteProject(projectId: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error('No autenticado')

    const existing = await db.project.findUnique({ where: { id: projectId } })
    if (!existing) throw new Error('Proyecto no encontrado')
    if (existing.ownerId !== session.user.id && session.user.role !== 'ADMIN')
        throw new Error('Sin permiso')

    await db.project.delete({ where: { id: projectId } })

    // Reputation: -10 for deleting a project
    await updateReputation(existing.ownerId, -10)

    revalidatePath('/projects')
}
