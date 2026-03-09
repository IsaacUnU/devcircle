'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { createGroupSchema, CreateGroup } from '@/lib/validations'

export async function createGroup(data: CreateGroup) {
    const session = await auth()
    if (!session?.user?.id) throw new Error('No autenticado')

    const parsed = createGroupSchema.safeParse(data)
    if (!parsed.success) throw new Error(parsed.error.errors[0].message)

    const group = await db.group.create({
        data: {
            ...parsed.data,
            creatorId: session.user.id,
            members: {
                create: {
                    userId: session.user.id,
                    role: 'ADMIN',
                },
            },
        },
    })

    revalidatePath('/groups')
    return group
}
