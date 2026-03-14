import type { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'
import { Code2, Github } from 'lucide-react'

export const metadata: Metadata = { title: 'Iniciar sesión' }

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Code2 className="w-8 h-8 text-brand-500" />
          <span className="text-2xl font-bold tracking-tight">Devora</span>
        </div>

        <div className="card p-6">
          <h1 className="text-xl font-semibold text-text-primary mb-1">Bienvenido de vuelta</h1>
          <p className="text-sm text-text-muted mb-6">Inicia sesión en tu cuenta</p>

          <LoginForm />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface-card px-2 text-text-muted">o continúa con</span>
            </div>
          </div>

          {/* OAuth buttons */}
          <div className="space-y-2">
            <a
              href="/api/auth/signin/github"
              className="btn-secondary flex items-center justify-center gap-2 w-full"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </div>
        </div>

        <p className="text-center text-sm text-text-muted mt-4">
          ¿No tienes cuenta?{' '}
          <Link href="/auth/register" className="text-brand-400 hover:text-brand-300 font-medium">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}
