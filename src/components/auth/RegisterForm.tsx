'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { registerSchema, type RegisterInput } from '@/lib/validations'
import { register as registerUser } from '@/lib/actions/auth'
import toast from 'react-hot-toast'

export function RegisterForm() {
    const router = useRouter()
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
    })

    async function onSubmit(data: RegisterInput) {
        setLoading(true)
        try {
            await registerUser(data)
            toast.success('¡Cuenta creada con éxito! Ya puedes iniciar sesión.')
            router.push('/auth/login')
        } catch (err: any) {
            toast.error(err.message || 'Error al registrarse')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-text-muted uppercase mb-1.5 block ml-1">
                        Nombre Usuario
                    </label>
                    <input
                        {...register('username')}
                        placeholder="johndoe"
                        className="input"
                        disabled={loading}
                    />
                    {errors.username && (
                        <p className="text-[10px] text-red-400 mt-1 ml-1 font-medium">{errors.username.message}</p>
                    )}
                </div>
                <div>
                    <label className="text-xs font-bold text-text-muted uppercase mb-1.5 block ml-1">
                        Nombre Real
                    </label>
                    <input
                        {...register('name')}
                        placeholder="John Doe"
                        className="input"
                        disabled={loading}
                    />
                    {errors.name && (
                        <p className="text-[10px] text-red-400 mt-1 ml-1 font-medium">{errors.name.message}</p>
                    )}
                </div>
            </div>

            <div>
                <label className="text-xs font-bold text-text-muted uppercase mb-1.5 block ml-1">
                    Email Professional
                </label>
                <input
                    {...register('email')}
                    type="email"
                    placeholder="tu@email.com"
                    className="input"
                    disabled={loading}
                />
                {errors.email && (
                    <p className="text-[10px] text-red-400 mt-1 ml-1 font-medium">{errors.email.message}</p>
                )}
            </div>

            <div>
                <label className="text-xs font-bold text-text-muted uppercase mb-1.5 block ml-1">
                    Contraseña
                </label>
                <div className="relative">
                    <input
                        {...register('password')}
                        type={showPass ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="input pr-10"
                        disabled={loading}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPass(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                    >
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
                {errors.password && (
                    <p className="text-[10px] text-red-400 mt-1 ml-1 font-medium">{errors.password.message}</p>
                )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-4 font-bold tracking-tight mt-4">
                {loading ? (
                    <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creando cuenta...
                    </div>
                ) : 'Crear mi cuenta'}
            </button>
        </form>
    )
}
