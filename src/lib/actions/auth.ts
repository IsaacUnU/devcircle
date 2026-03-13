'use server'

import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { registerSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'

export async function register(data: any) {
    const parsed = registerSchema.safeParse(data)
    if (!parsed.success) {
        throw new Error(parsed.error.errors[0].message)
    }

    const { email, username, name, password, bio, website, location, country } = parsed.data

    // Rate limit por email para evitar spam de registros
    const rl = await rateLimit('register', email, RATE_LIMITS.register)
    if (!rl.ok) throw new Error(rl.message)

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
            password: hashedPassword,   // campo dedicado en User
            accounts: {
                create: {
                    type: 'credentials',
                    provider: 'credentials',
                    providerAccountId: email,
                    // access_token ya no se usa para la contraseña
                },
            },
        },
    })

    return user
}
