'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Loader2, ArrowLeft } from 'lucide-react'
import { getAvatarUrl, cn, timeAgo } from '@/lib/utils'
import { sendMessage, markConversationAsRead } from '@/lib/actions/messages'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Message {
    id: string
    content: string
    createdAt: Date
    senderId: string
    sender: { username: string; image: string | null }
}

interface Props {
    conversationId: string
    currentUserId: string
    otherUser: { id: string; username: string; name: string | null; image: string | null }
    initialMessages: any[]
}

export function ChatView({ conversationId, currentUserId, otherUser, initialMessages }: Props) {
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [content, setContent] = useState('')
    const [sending, setSending] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setMessages(initialMessages)
        markAsRead()
    }, [conversationId, initialMessages])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }

    const markAsRead = async () => {
        try {
            await markConversationAsRead(conversationId)
        } catch (e) { }
    }

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim() || sending) return

        const tempContent = content.trim()
        setContent('')
        setSending(true)

        try {
            const msg = await sendMessage({
                conversationId,
                receiverId: otherUser.id,
                content: tempContent
            })
            // @ts-ignore
            setMessages(prev => [...prev, { ...msg, sender: { username: 'Tú', image: null } }])
        } catch (err: any) {
            toast.error('Error al enviar mensaje')
            setContent(tempContent)
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="flex-1 flex flex-col bg-[#0a0a0a]">
            {/* Header */}
            <div className="h-16 border-b border-surface-border flex items-center justify-between px-6 glass sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <Link href="/messages" className="md:hidden p-2 -ml-2 text-text-muted hover:text-text-primary">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="relative">
                        <img
                            src={otherUser.image ?? getAvatarUrl(otherUser.username)}
                            alt=""
                            className="w-9 h-9 rounded-full shadow-lg"
                        />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-brand-500 rounded-full border-2 border-[#161b22]" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-text-primary leading-tight">
                            {otherUser.name ?? otherUser.username}
                        </p>
                        <p className="text-[10px] text-brand-400 font-bold uppercase tracking-widest mt-0.5">En línea</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
            >
                {messages.map((msg, i) => {
                    const isMe = msg.senderId === currentUserId
                    return (
                        <div
                            key={msg.id}
                            className={cn(
                                'flex flex-col max-w-[80%]',
                                isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                            )}
                        >
                            <div
                                className={cn(
                                    'px-4 py-2.5 rounded-2xl text-sm shadow-xl',
                                    isMe
                                        ? 'bg-brand-500 text-white rounded-tr-none'
                                        : 'bg-surface-card border border-surface-border text-text-primary rounded-tl-none'
                                )}
                            >
                                {msg.content}
                            </div>
                            <span className="text-[10px] text-text-muted mt-1.5 px-1 font-medium italic">
                                {timeAgo(msg.createdAt)}
                            </span>
                        </div>
                    )
                })}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-surface-border glass">
                <form
                    onSubmit={handleSend}
                    className="flex items-center gap-3 bg-white/5 rounded-2xl p-1.5 border border-white/5 focus-within:border-brand-500/50 transition-all duration-300"
                >
                    <input
                        type="text"
                        placeholder="Escribe un mensaje..."
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        disabled={sending}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-4 placeholder:text-text-muted text-text-primary outline-none"
                    />
                    <button
                        type="submit"
                        disabled={!content.trim() || sending}
                        className="w-10 h-10 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:bg-surface-hover disabled:text-text-muted text-white flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-brand-500/20"
                    >
                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </form>
            </div>
        </div>
    )
}
