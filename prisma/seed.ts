/**
 * Devora — Seed de desarrollo
 * Crea usuarios realistas de prueba + admin IsaacUnU
 * Ejecutar con: npm run db:seed
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

// ── Datos de usuarios ────────────────────────────────────────────────────────

const users = [
  {
    username: 'IsaacUnU',
    email: 'isaac@devora.dev',
    name: 'Isaac López',
    password: 'Admin1234!',
    bio: '🚀 Full-stack dev & creador de Devora. Apasionado del open-source y las redes sociales para devs.',
    website: 'https://github.com/isaaclopez',
    location: 'Alicante, España',
    role: 'ADMIN' as const,
    reputation: 980,
    verified: true,
  },
  {
    username: 'alexdev',
    email: 'alex@devora.dev',
    name: 'Alejandro Martín',
    password: 'Test1234!',
    bio: '💻 Backend developer obsesionado con Rust y sistemas distribuidos. Coffee addict ☕',
    website: 'https://alexdev.io',
    location: 'Madrid, España',
    role: 'USER' as const,
    reputation: 540,
    verified: false,
  },
  {
    username: 'saramontoya',
    email: 'sara@devora.dev',
    name: 'Sara Montoya',
    password: 'Test1234!',
    bio: '🎨 Frontend dev & UX lover. React, TypeScript y mucho CSS. Creo que el diseño importa tanto como el código.',
    website: 'https://saramontoya.dev',
    location: 'Barcelona, España',
    role: 'USER' as const,
    reputation: 720,
    verified: true,
  },
  {
    username: 'carlosml',
    email: 'carlos@devora.dev',
    name: 'Carlos Jiménez',
    password: 'Test1234!',
    bio: '🤖 ML Engineer en love con Python y PyTorch. Kaggle grandmaster. Building AI things.',
    location: 'Valencia, España',
    role: 'USER' as const,
    reputation: 890,
    verified: true,
  },
  {
    username: 'lauraops',
    email: 'laura@devora.dev',
    name: 'Laura García',
    password: 'Test1234!',
    bio: '☁️ DevOps & Cloud architect. AWS, Kubernetes, Terraform. Si no está automatizado, no cuenta.',
    location: 'Bilbao, España',
    role: 'USER' as const,
    reputation: 430,
    verified: false,
  },
  {
    username: 'miguelsec',
    email: 'miguel@devora.dev',
    name: 'Miguel Rodríguez',
    password: 'Test1234!',
    bio: '🔐 Cybersecurity engineer & ethical hacker. CTF player. Bug bounty hunter.',
    website: 'https://miguelsec.xyz',
    location: 'Sevilla, España',
    role: 'USER' as const,
    reputation: 610,
    verified: false,
  },
  {
    username: 'anaruby',
    email: 'ana@devora.dev',
    name: 'Ana Fernández',
    password: 'Test1234!',
    bio: '💎 Ruby on Rails dev & open-source contributor. Amante de la simplicidad y el código limpio.',
    location: 'Málaga, España',
    role: 'USER' as const,
    reputation: 340,
    verified: false,
  },
]

// ── Posts de prueba ──────────────────────────────────────────────────────────

const posts = [
  {
    authorUsername: 'alexdev',
    content: '¿Alguien más está usando Rust para servicios backend? Llevamos 6 meses migrando de Node.js y la diferencia en consumo de memoria es brutal. De 800MB a 40MB en el mismo servicio 🦀',
    tags: ['rust', 'backend', 'performance'],
  },
  {
    authorUsername: 'saramontoya',
    content: 'Hot take: los Loading Skeletons mejoran la percepción de velocidad más que optimizar el TTI real. El usuario no sabe cuánto tarda, pero SÍ nota si ve una pantalla en blanco.\n\n¿Cuál es vuestra estrategia de loading states favorita?',
    tags: ['ux', 'frontend', 'performance'],
  },
  {
    authorUsername: 'carlosml',
    content: 'Acabo de publicar mi nuevo proyecto: un clasificador de bugs automático usando LLMs fine-tuneados con datos de GitHub Issues. Precisión del 94% en categorización.\n\nRepo en mi perfil 🚀',
    codeSnip: 'model = AutoModelForSequenceClassification.from_pretrained(\n    "microsoft/codebert-base",\n    num_labels=len(label_map)\n)\ntrainer = Trainer(model=model, args=training_args)',
    language: 'python',
    tags: ['machinelearning', 'llm', 'python', 'github'],
  },
  {
    authorUsername: 'IsaacUnU',
    content: '¡Devora ya está en marcha! 🎉 La red social hecha por y para developers.\n\nSin algoritmos raros, sin ads, sin ruido. Solo código, proyectos y gente que comparte tu pasión.\n\nBienvenidos a todos 💜',
    tags: ['devora', 'community', 'developers'],
  },
  {
    authorUsername: 'lauraops',
    content: 'Tip del día: si estás usando Kubernetes y los pods tardan mucho en arrancar, revisa tus readinessProbe. Un threshold mal configurado puede estar matando tu P99.\n\nAprended de mis errores 😅',
    codeSnip: 'readinessProbe:\n  httpGet:\n    path: /health\n    port: 3000\n  initialDelaySeconds: 10\n  periodSeconds: 5\n  failureThreshold: 3',
    language: 'yaml',
    tags: ['kubernetes', 'devops', 'k8s'],
  },
  {
    authorUsername: 'miguelsec',
    content: 'Recordatorio amistoso: si guardáis contraseñas en texto plano en 2025 os merece todo lo que os pase.\n\nbcrypt con cost factor 12 mínimo. Argon2id si queréis lo más actual. No hay excusas.',
    tags: ['security', 'passwords', 'backend'],
  },
  {
    authorUsername: 'anaruby',
    content: 'Después de 3 años con Rails, lo que más valoro no es la velocidad de desarrollo (que también), sino la convención sobre configuración. Menos decisiones = menos fatiga mental = más código real.',
    tags: ['ruby', 'rails', 'webdev'],
  },
  {
    authorUsername: 'saramontoya',
    content: 'CSS tip que me cambió la vida: usa `gap` en lugar de `margin` para separar elementos en flex/grid. Tu CSS será la mitad de complicado y no tendrás que hackear el último hijo nunca más.',
    codeSnip: '/* ❌ Antes */\n.item + .item { margin-left: 1rem; }\n\n/* ✅ Ahora */\n.container { display: flex; gap: 1rem; }',
    language: 'css',
    tags: ['css', 'frontend', 'tips'],
  },
]

// ── Función principal ────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Iniciando seed de Devora...\n')

  // 1. Crear usuarios
  console.log('👤 Creando usuarios...')
  const createdUsers: Record<string, any> = {}

  for (const userData of users) {
    const { password, role, reputation, verified, ...rest } = userData
    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await db.user.upsert({
      where: { email: rest.email },
      update: {},
      create: {
        ...rest,
        password: hashedPassword,
        role,
        reputation,
        verified,
        accounts: {
          create: {
            type: 'credentials',
            provider: 'credentials',
            providerAccountId: rest.email,
          },
        },
      },
    })

    createdUsers[userData.username] = user
    const badge = role === 'ADMIN' ? '👑 ADMIN' : '👤'
    console.log(`  ${badge} @${user.username} — ${user.email} (pass: ${password})`)
  }

  // 2. Crear follows (todos siguen a IsaacUnU, y entre ellos un poco)
  console.log('\n🔗 Creando follows...')
  const followPairs = [
    ['alexdev', 'IsaacUnU'],
    ['saramontoya', 'IsaacUnU'],
    ['carlosml', 'IsaacUnU'],
    ['lauraops', 'IsaacUnU'],
    ['miguelsec', 'IsaacUnU'],
    ['anaruby', 'IsaacUnU'],
    ['IsaacUnU', 'alexdev'],
    ['IsaacUnU', 'saramontoya'],
    ['IsaacUnU', 'carlosml'],
    ['saramontoya', 'alexdev'],
    ['alexdev', 'carlosml'],
    ['carlosml', 'saramontoya'],
    ['lauraops', 'miguelsec'],
    ['miguelsec', 'lauraops'],
    ['anaruby', 'saramontoya'],
  ]

  for (const [follower, following] of followPairs) {
    if (!createdUsers[follower] || !createdUsers[following]) continue
    await db.follow.upsert({
      where: {
        followerId_followingId: {
          followerId: createdUsers[follower].id,
          followingId: createdUsers[following].id,
        },
      },
      update: {},
      create: {
        followerId: createdUsers[follower].id,
        followingId: createdUsers[following].id,
      },
    })
  }
  console.log(`  ✅ ${followPairs.length} relaciones de follow creadas`)

  // 3. Crear posts
  console.log('\n📝 Creando posts...')
  const createdPosts: any[] = []

  for (const postData of posts) {
    const author = createdUsers[postData.authorUsername]
    if (!author) continue

    const post = await db.post.create({
      data: {
        content: postData.content,
        codeSnip: postData.codeSnip ?? null,
        language: postData.language ?? null,
        authorId: author.id,
        tags: postData.tags?.length ? {
          create: postData.tags.map(name => ({
            tag: {
              connectOrCreate: { where: { name }, create: { name } },
            },
          })),
        } : undefined,
      },
    })
    createdPosts.push(post)
    console.log(`  ✅ Post de @${postData.authorUsername}: "${postData.content.slice(0, 50)}..."`)
  }

  // 4. Crear likes en posts
  console.log('\n❤️  Creando likes...')
  let likeCount = 0
  for (const post of createdPosts) {
    // Varios usuarios dan like a cada post (excepto el autor)
    const likers = Object.values(createdUsers).filter((u: any) => u.id !== post.authorId)
    const randomLikers = likers.slice(0, Math.floor(Math.random() * likers.length) + 1)
    for (const liker of randomLikers as any[]) {
      await db.like.upsert({
        where: { userId_postId: { userId: liker.id, postId: post.id } },
        update: {},
        create: { userId: liker.id, postId: post.id },
      })
      likeCount++
    }
  }
  console.log(`  ✅ ${likeCount} likes creados`)

  // 5. Crear comentarios
  console.log('\n💬 Creando comentarios...')
  const comments = [
    { postIdx: 0, authorUsername: 'IsaacUnU', content: 'Totalmente de acuerdo. Rust en backend es el futuro, el compilador te obliga a escribir código correcto desde el principio.' },
    { postIdx: 0, authorUsername: 'carlosml', content: '¿Habéis probado también Axum como framework? A mí me ha convencido más que Actix.' },
    { postIdx: 1, authorUsername: 'alexdev', content: 'Completamente de acuerdo. El skeleton UI es el truco más barato para que una app parezca más rápida de lo que es.' },
    { postIdx: 2, authorUsername: 'saramontoya', content: '¡Esto está genial Carlos! ¿Tienes pensado publicar el dataset también?' },
    { postIdx: 3, authorUsername: 'alexdev', content: '¡Por fin una red social que entiende lo que necesitamos los devs! 🎉' },
    { postIdx: 4, authorUsername: 'IsaacUnU', content: 'Gran tip Laura. Los readinessProbe son el típico copy-paste que nadie entiende hasta que la lía parda en producción.' },
    { postIdx: 7, authorUsername: 'IsaacUnU', content: 'El `gap` es de las mejores cosas que le han pasado a CSS. Junto con las custom properties, ha cambiado totalmente mi forma de escribir estilos.' },
  ]

  for (const c of comments) {
    const post = createdPosts[c.postIdx]
    const author = createdUsers[c.authorUsername]
    if (!post || !author) continue
    await db.comment.create({
      data: { content: c.content, postId: post.id, authorId: author.id },
    })
  }
  console.log(`  ✅ ${comments.length} comentarios creados`)

  // 6. Crear bookmarks
  console.log('\n🔖 Creando bookmarks...')
  const isaac = createdUsers['IsaacUnU']
  for (const post of createdPosts.slice(0, 4)) {
    await db.bookmark.upsert({
      where: { userId_postId: { userId: isaac.id, postId: post.id } },
      update: {},
      create: { userId: isaac.id, postId: post.id },
    })
  }
  console.log(`  ✅ 4 bookmarks creados para @IsaacUnU`)

  // Resumen final
  console.log('\n' + '─'.repeat(55))
  console.log('🎉 Seed completado con éxito!\n')
  console.log('📋 CREDENCIALES DE ACCESO:')
  console.log('─'.repeat(55))
  console.log('👑 ADMIN  → isaac@devora.dev     | Admin1234!')
  console.log('👤 TEST   → alex@devora.dev      | Test1234!')
  console.log('👤 TEST   → sara@devora.dev      | Test1234!')
  console.log('👤 TEST   → carlos@devora.dev    | Test1234!')
  console.log('👤 TEST   → laura@devora.dev     | Test1234!')
  console.log('👤 TEST   → miguel@devora.dev    | Test1234!')
  console.log('👤 TEST   → ana@devora.dev       | Test1234!')
  console.log('─'.repeat(55))
  console.log(`\n✅ ${users.length} usuarios | ${createdPosts.length} posts | ${likeCount} likes | ${comments.length} comentarios`)
}

main()
  .catch(e => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
