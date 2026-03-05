import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter:   () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/feed',
  redirect:    vi.fn(),
}))

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: { id: 'user-1', username: 'testuser', name: 'Test User', email: 'test@test.com', role: 'USER' }
    },
    status: 'authenticated'
  }),
  signIn:  vi.fn(),
  signOut: vi.fn(),
  SessionProvider: ({ children }: any) => children,
}))
