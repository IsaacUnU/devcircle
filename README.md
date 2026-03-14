# Devora 🚀

> La red social definitiva para desarrolladores. Comparte proyectos, código, clips y conecta con una comunidad global de talento técnico.

**Stack Moderno:** Next.js 14 (App Router) · Prisma · PostgreSQL · Supabase (Realtime) · TypeScript · Tailwind CSS · NextAuth v5 · TanStack Query

---

## ✨ Características Principales

### 📱 Contenido y Comunidad
- **Feed Inteligente**: Algoritmo que prioriza contenido de tus intereses y conexiones.
- **DevClips (Reels)**: Comparte pequeños clips de video sobre tus avances o tips rápidos.
- **Grupos Temáticos**: Comunidades privadas o públicas con sistema de invitaciones y moderación.
- **Eventos**: Calendario integrado para Meetups, Hackathons y Conferencias.

### 💼 Carrera y Portafolio
- **Showcase de Proyectos**: Destaca tus mejores trabajos con tech stack detallado y enlaces a repositorios.
- **Tablón de Empleos**: Encuentra oportunidades exclusivas para desarrolladores (Full-time, Freelance, Remote).
- **Sistema de Reputación**: Gana puntos por tus contribuciones y ayuda a la comunidad.

### 💬 Comunicación en Tiempo Real
- **Mensajería Directa**: Chats instantáneos con soporte para compartición de código.
- **Notificaciones en Vivo**: Alertas al instante (likes, menciones, solicitudes) gracias a Supabase Realtime.
- **Perfiles Privados**: Control total sobre quién te sigue y ve tu actividad.

---

## 🚀 Puesta en marcha

### 1. Requisitos
- Node.js 18+
- PostgreSQL (local o [Neon](https://neon.tech) / [Supabase](https://supabase.com))

### 2. Instalación rápida
```bash
npm install
cp .env.example .env
# Edita .env con tus credenciales (DATABASE_URL, NEXTAUTH_SECRET, etc.)
```

### 3. Base de datos y arranque
```bash
npm run db:push     # Sincroniza el esquema de Prisma con la base de datos
npm run db:seed     # Inserta datos de prueba para desarrollo
npm run dev         # Inicia el servidor de desarrollo en http://localhost:3000
```

---

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router (Rutas, API, Modales)
├── components/             # Componentes de UI (Radix, Tailwind, Lucide)
├── hooks/                  # Hooks personalizados (Realtime, Query, Form)
├── lib/
│   ├── actions/            # Server Actions para mutaciones de datos
│   ├── queries/            # Lógica de obtención de datos (Server-side)
│   ├── auth.ts             # Configuración de NextAuth.js v5
│   └── supabase.ts         # Integración para funcionalidades Realtime
└── store/                  # Estado global de la UI con Zustand
```

---

## 🧪 Calidad y Testing

Mantenemos un estándar de calidad riguroso para asegurar la estabilidad del proyecto:

```bash
# Tests unitarios y de integración (Vitest)
npm run test

# Tests End-to-End (Playwright)
npm run test:e2e
```

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Propósito |
|------------|-----------|
| **Next.js 14** | Framework principal (Server Components, Streaming) |
| **Prisma** | ORM para una gestión de base de datos segura y tipada |
| **Supabase** | Motor de tiempo real para DMs y notificaciones |
| **NextAuth v5** | Sistema de autenticación robusto |
| **Tailwind CSS** | Estilizado moderno y modo oscuro nativo |
| **TanStack Query** | Sincronización de estado de servidor |
| **Zustand** | Gestión de estado local y de UI |

---

## 🔜 Próximamente (Roadmap)

- [ ] Buscador global con filtros avanzados.
- [ ] Integración con GitHub API para importar proyectos automáticamente.
- [ ] Sistema de medallas (badges) por logros técnicos.
- [ ] Streaming en vivo para sesiones de live coding.

---
Hecho con 💚 por la comunidad de **Devora**.
