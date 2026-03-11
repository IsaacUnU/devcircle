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

    const { email, username, name, password, bio, website, location, country } = parsed.data

    const existingEmail = await db.user.findUnique({ where: { email } })
    if (existingEmail) throw new Error('El email ya está registrado')

    const existingUser = await db.user.findUnique({ where: { username } })
    if (existingUser) throw new Error('El nombre de usuario ya está en uso')

    const hashedPassword = await bcrypt.hash(password, 12)

    // Combinar ciudad y país en location: "Alicante, España"
    const fullLocation = location && country
      ? `${location}, ${country}`
      : location || country || null

    const user = await db.user.create({
        data: {
            email,
            username,
            name,
            bio:      bio      || null,
            website:  website  || null,
            location: fullLocation,
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
