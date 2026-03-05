# DevCircle 🔵

> Red social para developers. Comparte proyectos, código y conecta con otros devs.

**Stack:** Next.js 14 App Router · Prisma · PostgreSQL · TypeScript · Tailwind CSS · NextAuth v5

---

## 🚀 Puesta en marcha

### 1. Requisitos
- Node.js 18+
- PostgreSQL (local o [Neon](https://neon.tech) / [Supabase](https://supabase.com) gratis)

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
# Edita .env con tu DATABASE_URL y NEXTAUTH_SECRET
```

### 4. Base de datos
```bash
npm run db:push     # Crea las tablas
npm run db:seed     # Añade datos de prueba
npm run db:studio   # Abre Prisma Studio (GUI)
```

### 5. Arrancar
```bash
npm run dev
# http://localhost:3000
```

---

## 📁 Estructura del proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── (main)/             # Layout con sidebar
│   │   ├── profile/[username]/
│   │   └── post/[id]/
│   ├── auth/               # Login / Register
│   │   ├── login/
│   │   └── register/
│   ├── feed/               # Feed principal
│   ├── api/                # Route handlers
│   └── layout.tsx          # Root layout
│
├── components/
│   ├── auth/               # LoginForm, RegisterForm
│   ├── layout/             # Sidebar
│   ├── post/               # PostCard, ComposeModal
│   └── profile/            # FollowButton
│
├── lib/
│   ├── actions/            # Server Actions (mutations)
│   │   ├── posts.ts        # createPost, toggleLike, addComment...
│   │   └── users.ts        # toggleFollow, updateProfile...
│   ├── auth.ts             # NextAuth config
│   ├── db.ts               # Prisma client singleton
│   ├── queries.ts          # Server-side data fetching
│   ├── store.ts            # Zustand UI store
│   ├── utils.ts            # Helpers (cn, timeAgo, formatCount...)
│   └── validations.ts      # Zod schemas
│
├── tests/                  # Vitest unit tests
├── types/                  # TypeScript types
└── middleware.ts            # Auth middleware

prisma/
├── schema.prisma           # Data model
└── seed.ts                 # Seed data

e2e/                        # Playwright E2E tests
```

---

## 🗄️ Modelo de datos

```
User ──── Post ──── Comment
  │          │         │
  │       PostTag    likes
  │          │
  │         Tag
  │
  ├── Follow (self-referential)
  ├── Like
  ├── Bookmark
  └── Notification
```

---

## 🧪 Testing

```bash
# Unit tests (Vitest)
npm run test
npm run test -- --coverage

# E2E tests (Playwright)
npm run test:e2e
npx playwright show-report
```

---

## ✨ Features implementadas

- [x] Autenticación con NextAuth (credentials + GitHub OAuth)
- [x] Feed personalizado (posts de usuarios seguidos)
- [x] Crear posts con código y tags
- [x] Likes y bookmarks (optimistic UI)
- [x] Comentarios y respuestas anidadas
- [x] Sistema de follows
- [x] Perfil de usuario
- [x] Notificaciones
- [x] Middleware de rutas protegidas

## 🔜 Próximas features

- [ ] Búsqueda de usuarios y posts
- [ ] Feed infinito con TanStack Query
- [ ] Subida de imágenes (Cloudinary / UploadThing)
- [ ] Página de notificaciones
- [ ] DMs entre usuarios
- [ ] Trending tags
- [ ] Registro con email/contraseña

---

## 🛠️ Skills utilizadas

| Área | Skill |
|------|-------|
| Arquitectura | `software-architecture`, `nextjs-app-router-patterns` |
| Base de datos | `prisma-expert`, `postgresql`, `database-design` |
| Auth | `auth-implementation-patterns` |
| Frontend | `frontend-design`, `react-best-practices`, `tailwind-patterns` |
| Estado | `react-state-management` |
| TypeScript | `typescript-expert` |
| Testing | `tdd-workflow`, `javascript-testing-patterns`, `e2e-testing-patterns` |
| Calidad | `clean-code`, `debugging-strategies` |
| Git | `git-advanced-workflows` |
