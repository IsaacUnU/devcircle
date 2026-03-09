import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding DevCircle...')

  // Clear existing data (optional but recommended for fresh experience)
  await prisma.videoLike.deleteMany()
  await prisma.videoComment.deleteMany()
  await prisma.video.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.post.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()
  await prisma.tag.deleteMany()

  const hashedPassword = await bcrypt.hash('password123', 12)

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@devcircle.dev',
        username: 'alice',
        name: 'Alice Dev',
        bio: 'Full-stack developer. Loves React and PostgreSQL. 👨‍💻',
        role: Role.ADMIN,
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
        accounts: {
          create: {
            type: 'credentials',
            provider: 'credentials',
            providerAccountId: 'alice@devcircle.dev',
            access_token: hashedPassword,
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        email: 'bob@devcircle.dev',
        username: 'bob',
        name: 'Bob Builder',
        bio: 'Backend engineer. Rust enthusiast. Building robust systems.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
        accounts: {
          create: {
            type: 'credentials',
            provider: 'credentials',
            providerAccountId: 'bob@devcircle.dev',
            access_token: hashedPassword,
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        email: 'carlos@devcircle.dev',
        username: 'carlos',
        name: 'Carlos Code',
        bio: 'Learning Next.js. Building in public. 🚀',
        location: 'Alicante, ES',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
        accounts: {
          create: {
            type: 'credentials',
            provider: 'credentials',
            providerAccountId: 'carlos@devcircle.dev',
            access_token: hashedPassword,
          }
        }
      }
    })
  ])

  const [alice, bob, carlos] = users

  // Create tags
  const tagNames = ['react', 'nextjs', 'typescript', 'postgresql', 'rust', 'css', 'devops', 'opensource']
  await Promise.all(tagNames.map(name => prisma.tag.create({ data: { name } })))

  // Create high-fidelity clips
  const clips = await Promise.all([
    prisma.video.create({
      data: {
        title: 'React Server Components en 30s',
        description: 'La forma más rápida de entender por qué las Server Components son el futuro del desarrollo web. #nextjs #react',
        url: 'https://player.vimeo.com/external/370331493.sd.mp4?s=7b01b69828d57a9bc2cf1896796c95c2e171b3e7&profile_id=139&oauth2_token_id=57447761',
        authorId: alice.id,
        tags: ['react', 'nextjs'],
        views: 1240,
      }
    }),
    prisma.video.create({
      data: {
        title: 'Optimize SQL Queries',
        description: 'No uses SELECT * en producción. Usa índices y proyecciones para mejorar el rendimiento de tu DB. #postgresql #backend',
        url: 'https://player.vimeo.com/external/370331493.sd.mp4?s=7b01b69828d57a9bc2cf1896796c95c2e171b3e7&profile_id=139&oauth2_token_id=57447761',
        authorId: bob.id,
        tags: ['postgresql', 'backend'],
        views: 890,
      }
    }),
    prisma.video.create({
      data: {
        title: 'Dark Mode con Tailwind CSS v4',
        description: 'Implementa el modo oscuro dinámico en menos de 1 minuto con las nuevas variables CSS de Tailwind. #css #tailwind',
        url: 'https://player.vimeo.com/external/370331493.sd.mp4?s=7b01b69828d57a9bc2cf1896796c95c2e171b3e7&profile_id=139&oauth2_token_id=57447761',
        authorId: carlos.id,
        tags: ['css', 'frontend'],
        views: 2150,
      }
    })
  ])

  // Create interactions
  await prisma.videoLike.createMany({
    data: [
      { userId: bob.id, videoId: clips[0].id },
      { userId: carlos.id, videoId: clips[0].id },
      { userId: alice.id, videoId: clips[1].id },
    ]
  })

  await prisma.videoComment.createMany({
    data: [
      { content: '¡Increíble explicación! Super claro.', userId: bob.id, videoId: clips[0].id },
      { content: 'Exacto, el SELECT * es un error de novato.', userId: carlos.id, videoId: clips[1].id },
    ]
  })

  console.log('✅ Base de Datos Poblada con Éxito!')
  console.log(`   🚀 Usuarios: alice, bob, carlos (Password: password123)`)
  console.log(`   🎬 Clips: ${clips.length}`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
