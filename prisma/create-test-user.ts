import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('password123', 12)

  const user = await prisma.user.upsert({
    where: { email: 'test@devora.dev' },
    update: {},
    create: {
      email:    'test@devora.dev',
      username: 'testuser',
      name:     'Test User',
      bio:      'Usuario de prueba',
    },
  })

  await prisma.account.upsert({
    where: {
      provider_providerAccountId: {
        provider:          'credentials',
        providerAccountId: user.email,
      },
    },
    update: { access_token: password },
    create: {
      userId:            user.id,
      type:              'credentials',
      provider:          'credentials',
      providerAccountId: user.email,
      access_token:      password,
    },
  })

  console.log('✅ Usuario creado:')
  console.log('   Email:      test@devora.dev')
  console.log('   Contraseña: password123')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())