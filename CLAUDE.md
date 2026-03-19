# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run lint         # ESLint

# Database
npm run db:push      # Sync Prisma schema to DB (no migration history)
npm run db:migrate   # Run migrations with history
npm run db:studio    # Open Prisma Studio GUI
npm run db:seed      # Seed database

# Testing
npm run test         # Vitest unit/integration tests
npm run test:e2e     # Playwright end-to-end tests
npx vitest run src/path/to/file.test.ts  # Run a single test file
```

## Architecture Overview

**DevCircle** is a social network for developers built with Next.js 14 App Router.

### Routing & Auth

- `src/app/(main)/` — all protected routes (feed, profile, messages, events, etc.)
- `src/app/auth/` — public auth pages (login, register)
- `src/app/api/` — REST API route handlers
- `src/middleware.ts` — NextAuth middleware redirects unauthenticated users to `/auth/login`

### Data Layer

- **Prisma + PostgreSQL** (hosted on Supabase) — all DB access via `src/lib/db.ts` singleton
- **`src/lib/queries.ts`** — server-side read functions (pass directly to Server Components)
- **`src/lib/actions/`** — server actions for all mutations (posts, users, messages, events, etc.), call `revalidatePath()` for ISR invalidation
- **Supabase Storage** — media/file uploads via `src/lib/supabase.ts`

### State Management

- **Zustand** (`src/lib/store.ts`, `useUIStore`) — global UI state: modals, sidebar, notifications, language preference
- **TanStack Query** — client-side server state caching
- **NextAuth** — session state (JWT, no image in token to avoid cookie size limit)

### Component Patterns

- Server Components for data fetching; Client Components (`'use client'`) for interactivity
- Modal system driven by Zustand: `ComposeModal`, `ProjectModal`, etc. are controlled via store
- Layout components: `Sidebar` + `MobileBottomNav` wrap `(main)` routes

### Real-time

- Supabase Realtime subscriptions via `src/hooks/useRealtimeTable.ts`
- Notification polling via `src/hooks/useNotificationPolling.ts`

### Internationalization

- 15 languages, JSON files in `src/i18n/locales/`
- Client-side via `useTranslation()` hook from `src/lib/i18n.ts`
- Language persisted to localStorage and cookies

### Validation & Security

- **Zod** schemas in `src/lib/validations.ts` — used with React Hook Form via `@hookform/resolvers`
- **Rate limiting** per-user/per-action: `src/lib/rateLimit.ts`
- **Content moderation** scoring (not keyword blocklist): `src/lib/content-moderation.ts`

### Key Config

- Path alias: `@/*` → `./src/*`
- Tailwind dark mode: class-based; custom brand colors (green-based) via CSS variables
- Playwright: tests Desktop Chrome + iPhone 14; base URL `http://localhost:3000`
- Vitest: jsdom environment, coverage via Istanbul

### Environment Variables

See `.env.example` for required variables: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, GitHub and Google OAuth credentials, plus Supabase URL/keys (not in example).
