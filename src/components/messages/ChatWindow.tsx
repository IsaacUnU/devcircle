'use client'

import { useState, useRef, useEffect, useTransition, useCallback } from 'react'
import { Send, MoreVertical } from 'lucide-react'
import { cn, getAvatarUrl } from '@/lib/utils'
import { sendMessage } from '@/lib/actions/messages'
import { useRealtimeTable } from '@/hooks/useRealtimeTable'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Message {
  id: string
  content: string
  senderId: string
  createdAt: Date
  read: boolean
  sender: {
    id: string
    username: string
    name: string | null
    image: string | null
  }
}

interface Props {
  conversation: {
    id: string
    messages: Message[]
  }
  currentUserId: string
  otherUser: {
    id: string
    username: string
    name: string | null
    image: string | null
  }
}

export function ChatWindow({ conversation, currentUserId, otherUser }: Props) {
  const [messages, setMessages] = useState<Message[]>(conversation.messages)
  const [input, setInput]       = useState('')
  const [isPending, startTransition] = useTransition()
  const bottomRef  = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLTextAreaElement>(null)

  // Scroll al fondo cuando llegan mensajes nuevos
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Fetch de mensajes actualizado
  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages/${conversation.id}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages)
      }
    } catch {}
  }, [conversation.id])

  // Realtime: escucha INSERT en direct_messages de esta conversación
  useRealtimeTable(
    'direct_messages',
    { column: 'conversationId', value: conversation.id },
    fetchMessages
  )

  const handleSend = () => {
    if (!input.trim()) return
    const content = input.trim()
    setInput('')

    // Optimistic UI
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      content,
      senderId: currentUserId,
      createdAt: new Date(),
      read: false,
      sender: { id: currentUserId, username: 'me', name: null, image: null },
    }
    setMessages(prev => [...prev, optimistic])

    startTransition(async () => {
      try {
        await sendMessage({
          conversationId: conversation.id,
          receiverId: otherUser.id,
          content,
        })
        // El Realtime se encarga de refrescar con el mensaje real de BD
      } catch {
        toast.error('Error al enviar mensaje')
        setMessages(prev => prev.filter(m => m.id !== optimistic.id))
        setInput(content)
      }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Agrupar mensajes por fecha
  const groupedMessages = messages.reduce((acc, msg) => {
    const date = new Date(msg.createdAt).toLocaleDateString('es-ES', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
    if (!acc[date]) acc[date] = []
    acc[date].push(msg)
    return acc
  }, {} as Record<string, Message[]>)

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
        <Link href={`/profile/${otherUser.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img
            src={otherUser.image ?? getAvatarUrl(otherUser.username)}
            alt=""
            className="w-9 h-9 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-text-primary text-sm">
              {otherUser.name ?? otherUser.username}
            </p>
            <p className="text-xs text-text-muted">@{otherUser.username}</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[10px] text-brand-400 bg-brand-500/10 border border-brand-500/20 rounded-full px-2 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            En vivo
          </span>
          <button className="text-text-muted hover:text-text-primary transition-colors p-2 rounded-lg hover:bg-surface-hover">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-surface-border" />
              <span className="text-xs text-text-muted">{date}</span>
              <div className="flex-1 h-px bg-surface-border" />
            </div>
            <div className="space-y-2">
              {msgs.map((msg, i) => {
                const isMe      = msg.senderId === currentUserId
                const isFirst   = i === 0 || msgs[i - 1]?.senderId !== msg.senderId
                const isLast    = i === msgs.length - 1 || msgs[i + 1]?.senderId !== msg.senderId
                const isOptimistic = msg.id.startsWith('temp-')

                return (
                  <div key={msg.id} className={cn('flex items-end gap-2', isMe ? 'flex-row-reverse' : 'flex-row')}>
                    {/* Avatar (solo el otro usuario) */}
                    {!isMe && (
                      <div className="w-7 shrink-0">
                        {isLast && (
                          <img
                            src={otherUser.image ?? getAvatarUrl(otherUser.username)}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        )}
                      </div>
                    )}

                    {/* Burbuja */}
                    <div className={cn(
                      'max-w-xs lg:max-w-md px-4 py-2 text-sm transition-opacity',
                      isOptimistic && 'opacity-70',
                      isMe ? 'bg-brand-500 text-white' : 'bg-surface-hover text-text-primary',
                      isFirst && isLast  ? 'rounded-2xl' : '',
                      isFirst && !isLast ? (isMe ? 'rounded-t-2xl rounded-bl-2xl' : 'rounded-t-2xl rounded-br-2xl') : '',
                      isLast && !isFirst ? (isMe ? 'rounded-b-2xl rounded-tl-2xl' : 'rounded-b-2xl rounded-tr-2xl') : '',
                      !isFirst && !isLast ? 'rounded-2xl' : '',
                    )}>
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      <p className={cn('text-xs mt-1', isMe ? 'text-white/60' : 'text-text-muted')}>
                        {new Date(msg.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        {isMe && msg.read && <span className="ml-1">✓✓</span>}
                        {isOptimistic && <span className="ml-1">⏳</span>}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-surface-border">
        <div className="flex items-end gap-3 bg-surface-hover rounded-2xl px-4 py-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Mensaje a @${otherUser.username}...`}
            rows={1}
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none resize-none max-h-32"
            onInput={e => {
              const t = e.currentTarget
              t.style.height = 'auto'
              t.style.height = `${t.scrollHeight}px`
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isPending}
            className="w-9 h-9 rounded-xl bg-brand-500 hover:bg-brand-400 flex items-center justify-center text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-text-muted mt-2 text-center">Enter para enviar · Shift+Enter para nueva línea</p>
      </div>
    </div>
  )
}
