import type { Metadata } from 'next'
import Link from 'next/link'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { Code2, Github } from 'lucide-react'

export const metadata: Metadata = { title: 'Registrarse | Devora' }

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-surface px-4 py-20">
            <div className="w-full max-w-md animate-fade-in">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20 mb-4">
                        <Code2 className="w-10 h-10 text-brand-500" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase italic">Devora</h1>
                    <p className="text-text-muted font-medium mt-1">Únete a la elite de desarrolladores</p>
                </div>

                <div className="card p-8 shadow-2xl glass border-white/5">
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-text-primary">Crear cuenta</h2>
                        <p className="text-sm text-text-muted">Empieza a compartir tu conocimiento hoy mismo.</p>
                    </div>

                    <RegisterForm />

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/5" />
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                            <span className="bg-[#0a0a0a] px-3 text-text-muted">o continúa con</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <a
                            href="/api/auth/signin/github"
                            className="btn-secondary flex items-center justify-center gap-3 w-full py-3.5 font-bold transition-all hover:bg-white/10"
                        >
                            <Github className="w-5 h-5" />
                            GitHub
                        </a>
                    </div>
                </div>

                <p className="text-center text-sm text-text-muted mt-8">
                    ¿Ya tienes una cuenta?{' '}
                    <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 font-bold transition-colors underline underline-offset-4 decoration-brand-500/30">
                        Inicia sesión
                    </Link>
                </p>
            </div>
        </div>
    )
}
