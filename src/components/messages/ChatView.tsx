'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Loader2, ArrowLeft, Image as ImageIcon, Mic, Square } from 'lucide-react'
import { getAvatarUrl, cn, timeAgo } from '@/lib/utils'
import { sendMessage, markConversationAsRead } from '@/lib/actions/messages'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { uploadFile, MESSAGES_BUCKET } from '@/lib/supabase'

interface Message {
    id: string
    content: string
    createdAt: Date
    senderId: string
    sender: { username: string; image: string | null }
    mediaUrl?: string | null
    mediaType?: string | null
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

    // Media states
    const [uploadingImage, setUploadingImage] = useState(false)
    const [recording, setRecording] = useState(false)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const imageInputRef = useRef<HTMLInputElement>(null)

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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploadingImage(true)
        try {
            const path = `${conversationId}/${Date.now()}_${file.name}`
            const url = await uploadFile(MESSAGES_BUCKET, path, file)
            const msg = await sendMessage({
                conversationId,
                receiverId: otherUser.id,
                content: '',
                mediaUrl: url,
                mediaType: 'image'
            })
            // @ts-ignore
            setMessages(prev => [...prev, { ...msg, sender: { username: 'Tú', image: null } }])
        } catch(err) {
            toast.error('Error al subir imagen')
        } finally {
            setUploadingImage(false)
            if (imageInputRef.current) imageInputRef.current.value = ''
        }
    }

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            audioChunksRef.current = []

            mediaRecorder.ondataavailable = e => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data)
            }

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
                setSending(true)
                try {
                    const file = new File([audioBlob], 'audio.webm', { type: 'audio/webm' })
                    const path = `${conversationId}/${Date.now()}_audio.webm`
                    const url = await uploadFile(MESSAGES_BUCKET, path, file)

                    const msg = await sendMessage({
                        conversationId,
                        receiverId: otherUser.id,
                        content: '',
                        mediaUrl: url,
                        mediaType: 'audio'
                    })
                    // @ts-ignore
                    setMessages(prev => [...prev, { ...msg, sender: { username: 'Tú', image: null } }])
                } catch(err) {
                    toast.error('Error al enviar audio')
                } finally {
                    setSending(false)
                }
            }

            mediaRecorder.start()
            setRecording(true)
        } catch(err) {
            toast.error('Acceso al micrófono denegado')
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && recording) {
            mediaRecorderRef.current.stop()
            mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop())
            setRecording(false)
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
                            className="w-9 h-9 avatar object-cover shadow-lg"
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
                className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 scrollbar-hide"
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
                                {msg.mediaUrl && msg.mediaType === 'image' && (
                                    <img src={msg.mediaUrl} alt="Imagen ajustada" className="rounded-xl max-w-[70%] sm:max-w-[220px] mb-2 object-cover" />
                                )}
                                {msg.mediaUrl && msg.mediaType === 'audio' && (
                                    <audio src={msg.mediaUrl} controls className="max-w-[70%] sm:max-w-[220px] mb-2 h-8" />
                                )}
                                {msg.content && <p className="break-words max-w-full">{msg.content}</p>}
                            </div>
                            <span className="text-[10px] text-text-muted mt-1.5 px-1 font-medium italic">
                                {timeAgo(msg.createdAt)}
                            </span>
                        </div>
                    )
                })}
            </div>

            <div className="p-4 border-t border-surface-border glass">
                <form
                    onSubmit={handleSend}
                    className="flex items-center gap-2 sm:gap-3 bg-white/5 rounded-2xl p-1.5 border border-white/5 focus-within:border-brand-500/50 transition-all duration-300"
                >
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={imageInputRef} 
                        onChange={handleImageUpload} 
                    />
                    <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={sending || uploadingImage || recording}
                        className="p-2 text-text-muted hover:text-brand-400 disabled:opacity-50 transition-colors shrink-0"
                    >
                        {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin"/> : <ImageIcon className="w-5 h-5" />}
                    </button>

                    <button
                        type="button"
                        onClick={recording ? stopRecording : startRecording}
                        disabled={sending || uploadingImage}
                        className={cn(
                            "p-2 transition-colors shrink-0 rounded-full",
                            recording ? "bg-red-500/20 text-red-500 animate-pulse" : "text-text-muted hover:text-brand-400 disabled:opacity-50"
                        )}
                    >
                        {recording ? <Square className="w-4 h-4" /> : <Mic className="w-5 h-5" />}
                    </button>

                    <input
                        type="text"
                        placeholder={recording ? "Grabando audio..." : "Escribe un mensaje..."}
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        disabled={sending || recording}
                        className="flex-1 min-w-0 bg-transparent border-none focus:ring-0 text-sm px-2 placeholder:text-text-muted text-text-primary outline-none"
                    />
                    <button
                        type="submit"
                        disabled={(!content.trim() && !uploadingImage) || sending || recording}
                        className="w-10 h-10 shrink-0 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:bg-surface-hover disabled:text-text-muted text-white flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-brand-500/20"
                    >
                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </form>
            </div>
        </div>
    )
}
