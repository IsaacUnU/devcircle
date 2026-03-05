import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding DevCircle...')

  // Create users
  const password = await bcrypt.hash('password123', 12)

  const alice = await prisma.user.upsert({
    where: { email: 'alice@devcircle.dev' },
    update: {},
    create: {
      email: 'alice@devcircle.dev',
      username: 'alice',
      name: 'Alice Dev',
      bio: 'Full-stack developer. Loves React and PostgreSQL.',
      role: Role.ADMIN,
    },
  })

  const bob = await prisma.user.upsert({
    where: { email: 'bob@devcircle.dev' },
    update: {},
    create: {
      email: 'bob@devcircle.dev',
      username: 'bob',
      name: 'Bob Builder',
      bio: 'Backend engineer. Rust enthusiast.',
    },
  })

  const carlos = await prisma.user.upsert({
    where: { email: 'carlos@devcircle.dev' },
    update: {},
    create: {
      email: 'carlos@devcircle.dev',
      username: 'carlos',
      name: 'Carlos Code',
      bio: 'Learning Next.js. Building in public.',
      website: 'https://carlos.dev',
      location: 'Alicante, ES',
    },
  })

  // Create tags
  const tagNames = ['react', 'nextjs', 'typescript', 'postgresql', 'rust', 'css', 'devops', 'opensource']
  const tags = await Promise.all(
    tagNames.map(name =>
      prisma.tag.upsert({ where: { name }, update: {}, create: { name } })
    )
  )

  // Create posts
  const post1 = await prisma.post.create({
    data: {
      content: 'Just shipped a new feature using Server Actions in Next.js 14. The DX is incredible — no more API routes for simple mutations! 🚀',
      codeSnip: `// Server Action - no API route needed!
async function createPost(formData: FormData) {
  'use server'
  const content = formData.get('content') as string
  await db.post.create({ data: { content, authorId: session.user.id } })
  revalidatePath('/feed')
}`,
      language: 'typescript',
      authorId: alice.id,
      tags: {
        create: [
          { tag: { connect: { name: 'nextjs' } } },
          { tag: { connect: { name: 'typescript' } } },
        ],
      },
    },
  })

  const post2 = await prisma.post.create({
    data: {
      content: 'Hot take: Prisma + PostgreSQL is the best combo for Next.js apps in 2025. Type safety from DB to UI with zero boilerplate.',
      authorId: bob.id,
      tags: {
        create: [
          { tag: { connect: { name: 'postgresql' } } },
        ],
      },
    },
  })

  const post3 = await prisma.post.create({
    data: {
      content: 'Working on DevCircle, a social platform for developers. Building in public with Next.js, Prisma and PostgreSQL. Follow the journey! 👨‍💻',
      authorId: carlos.id,
      tags: {
        create: [
          { tag: { connect: { name: 'nextjs' } } },
          { tag: { connect: { name: 'opensource' } } },
        ],
      },
    },
  })

  // Create follows
  await prisma.follow.createMany({
    data: [
      { followerId: carlos.id, followingId: alice.id },
      { followerId: carlos.id, followingId: bob.id },
      { followerId: alice.id, followingId: bob.id },
    ],
    skipDuplicates: true,
  })

  // Create likes
  await prisma.like.createMany({
    data: [
      { userId: bob.id, postId: post1.id },
      { userId: carlos.id, postId: post1.id },
      { userId: alice.id, postId: post2.id },
      { userId: carlos.id, postId: post2.id },
    ],
    skipDuplicates: true,
  })

  // Create comments
  await prisma.comment.create({
    data: {
      content: 'Game changer! I ditched all my API routes last week.',
      authorId: bob.id,
      postId: post1.id,
    },
  })

  await prisma.comment.create({
    data: {
      content: 'Agreed 100%. The type safety all the way from DB to frontend is the killer feature.',
      authorId: carlos.id,
      postId: post2.id,
    },
  })

  console.log('✅ Seed complete!')
  console.log(`   Users: alice, bob, carlos`)
  console.log(`   Posts: ${3}`)
  console.log(`   Tags:  ${tagNames.join(', ')}`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
