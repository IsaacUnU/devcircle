'use server'

import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { registerSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function register(data: any) {
    const parsed = registerSchema.safeParse(data)
    if (!parsed.success) {
        throw new Error(parsed.error.errors[0].message)
    }

    const { email, username, name, password } = parsed.data

    const existingEmail = await db.user.findUnique({ where: { email } })
    if (existingEmail) throw new Error('El email ya está registrado')

    const existingUser = await db.user.findUnique({ where: { username } })
    if (existingUser) throw new Error('El nombre de usuario ya está en uso')

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await db.user.create({
        data: {
            email,
            username,
            name,
            accounts: {
                create: {
                    type: 'credentials',
                    provider: 'credentials',
                    providerAccountId: email,
                    access_token: hashedPassword,
                },
            },
        },
    })

    return user
}
