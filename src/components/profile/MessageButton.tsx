'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare } from 'lucide-react'
import { createOrGetConversation } from '@/lib/actions/messages'
import toast from 'react-hot-toast'

interface MessageButtonProps {
    targetUserId: string
}

export function MessageButton({ targetUserId }: MessageButtonProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleMessage = () => {
        startTransition(async () => {
            try {
                const conversationId = await createOrGetConversation(targetUserId)
                router.push(`/messages/${conversationId}`)
            } catch (err: any) {
                toast.error(err.message ?? 'Error al iniciar conversación')
            }
        })
    }

    return (
        <button
            onClick={handleMessage}
            disabled={isPending}
            className="btn-secondary text-sm flex items-center gap-2"
            title="Enviar mensaje"
        >
            <MessageSquare className="w-4 h-4" />
            {isPending ? 'Cargando...' : 'Mensaje'}
        </button>
    )
}
