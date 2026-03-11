// Script para limpiar imágenes Base64 de la BD
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function main() {
  const users = await db.user.findMany({
    where: { image: { startsWith: 'data:' } },
    select: { id: true, username: true },
  })

  console.log(`Encontrados ${users.length} usuarios con imagen Base64`)

  for (const user of users) {
    await db.user.update({
      where: { id: user.id },
      data: { image: null },
    })
    console.log(`Limpiado: @${user.username}`)
  }

  console.log('Listo. Ahora borra cookies y vuelve a hacer login.')
  await db.$disconnect()
}

main().catch(console.error)
