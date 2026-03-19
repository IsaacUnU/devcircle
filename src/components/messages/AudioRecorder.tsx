'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Send, Trash2, Play, Pause } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AudioRecorderProps {
  onSend: (blob: Blob, durationSec: number) => Promise<void>
  onCancel: () => void
  disabled?: boolean
}

// Formatea segundos → "0:05", "1:23"
function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export function AudioRecorder({ onSend, onCancel, disabled }: AudioRecorderProps) {
  const [phase, setPhase]       = useState<'recording' | 'preview'>('recording')
  const [elapsed, setElapsed]   = useState(0)
  const [isPlaying, setPlaying] = useState(false)
  const [playPos, setPlayPos]   = useState(0)
  const [sending, setSending]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const mediaRef    = useRef<MediaRecorder | null>(null)
  const chunksRef   = useRef<Blob[]>([])
  const blobRef     = useRef<Blob | null>(null)
  const durationRef = useRef(0)
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioRef    = useRef<HTMLAudioElement | null>(null)
  const streamRef   = useRef<MediaStream | null>(null)

  // Inicia grabación al montar
  useEffect(() => {
    startRecording()
    return () => {
      stopTimer()
      streamRef.current?.getTracks().forEach(t => t.stop())
      audioRef.current?.pause()
    }
  }, [])

  function stopTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
          ? 'audio/ogg;codecs=opus'
          : 'audio/mp4'

      const recorder = new MediaRecorder(stream, { mimeType })
      mediaRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        blobRef.current = blob
        durationRef.current = elapsed
        streamRef.current?.getTracks().forEach(t => t.stop())

        // Crear audio para preview
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audio.onended = () => { setPlaying(false); setPlayPos(0) }
        audio.ontimeupdate = () => setPlayPos(audio.currentTime)
        audioRef.current = audio

        setPhase('preview')
      }

      recorder.start(200) // chunk cada 200ms

      // Timer visual
      timerRef.current = setInterval(() => {
        setElapsed(prev => {
          // Máximo 2 minutos
          if (prev >= 120) {
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)
    } catch (err) {
      setError('No se puede acceder al micrófono. Comprueba los permisos del navegador.')
    }
  }

  function stopRecording() {
    stopTimer()
    if (mediaRef.current?.state === 'recording') mediaRef.current.stop()
  }

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play()
      setPlaying(true)
    }
  }

  async function handleSend() {
    if (!blobRef.current || sending) return
    setSending(true)
    try {
      await onSend(blobRef.current, durationRef.current)
    } catch {
      setError('Error al enviar el audio. Inténtalo de nuevo.')
      setSending(false)
    }
  }

  function handleCancel() {
    audioRef.current?.pause()
    URL.revokeObjectURL(audioRef.current?.src ?? '')
    onCancel()
  }

  // ── Waveform animado (solo decorativo durante grabación) ────────────────
  const bars = Array.from({ length: 24 }, (_, i) => i)

  if (error) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl">
        <p className="text-sm text-red-400 flex-1">{error}</p>
        <button onClick={handleCancel} className="text-text-muted hover:text-text-primary">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    )
  }

  // ── Fase de grabación ───────────────────────────────────────────────────
  if (phase === 'recording') {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-surface-hover rounded-2xl border border-red-500/30">
        {/* Indicador grabando */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-mono text-red-400 w-10">{formatTime(elapsed)}</span>
        </div>

        {/* Waveform animado */}
        <div className="flex items-center gap-0.5 flex-1 h-8">
          {bars.map(i => (
            <div
              key={i}
              className="w-0.5 rounded-full bg-red-400/70"
              style={{
                height: `${20 + Math.sin(Date.now() / 200 + i) * 10}%`,
                animationDelay: `${i * 50}ms`,
              }}
            />
          ))}
        </div>

        {/* Botón parar */}
        <button
          onClick={stopRecording}
          className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center transition-colors shrink-0"
          title="Detener grabación"
        >
          <Square className="w-3.5 h-3.5 text-white fill-white" />
        </button>

        {/* Cancelar */}
        <button
          onClick={handleCancel}
          className="w-7 h-7 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors shrink-0"
          title="Cancelar"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    )
  }

  // ── Fase de preview ─────────────────────────────────────────────────────
  const duration = durationRef.current || 1
  const progress = (playPos / duration) * 100

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-surface-hover rounded-2xl border border-brand-500/20">
      {/* Play / Pause */}
      <button
        onClick={togglePlay}
        className="w-8 h-8 rounded-full bg-brand-500/20 hover:bg-brand-500/30 flex items-center justify-center text-brand-400 transition-colors shrink-0"
      >
        {isPlaying
          ? <Pause className="w-3.5 h-3.5 fill-current" />
          : <Play  className="w-3.5 h-3.5 fill-current ml-0.5" />
        }
      </button>

      {/* Barra de progreso */}
      <div className="flex-1 flex flex-col gap-1">
        <div className="w-full h-1.5 bg-surface-border rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-text-muted">
          <span>{formatTime(playPos)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Icono mic */}
      <Mic className="w-4 h-4 text-text-muted shrink-0" />

      {/* Cancelar */}
      <button
        onClick={handleCancel}
        className="w-7 h-7 flex items-center justify-center text-text-muted hover:text-red-400 transition-colors"
        title="Descartar"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Enviar */}
      <button
        onClick={handleSend}
        disabled={sending || disabled}
        className="w-9 h-9 rounded-xl bg-brand-500 hover:bg-brand-400 flex items-center justify-center text-white transition-all disabled:opacity-40 shrink-0"
        title="Enviar nota de voz"
      >
        {sending
          ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          : <Send className="w-4 h-4" />
        }
      </button>
    </div>
  )
}

// ── Reproductor para mensajes recibidos ────────────────────────────────────
export function AudioMessage({
  url,
  isMe,
}: {
  url: string
  isMe: boolean
}) {
  const [isPlaying, setPlaying] = useState(false)
  const [playPos, setPlayPos]   = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = new Audio(url)
    audio.onloadedmetadata = () => setDuration(audio.duration)
    audio.ontimeupdate     = () => setPlayPos(audio.currentTime)
    audio.onended          = () => { setPlaying(false); setPlayPos(0) }
    audioRef.current = audio
    return () => { audio.pause(); audio.src = '' }
  }, [url])

  function toggle() {
    const a = audioRef.current
    if (!a) return
    if (isPlaying) { a.pause(); setPlaying(false) }
    else           { a.play();  setPlaying(true)  }
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const a = audioRef.current
    if (!a || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    a.currentTime = ratio * duration
  }

  const progress = duration > 0 ? (playPos / duration) * 100 : 0

  return (
    <div className={cn(
      'flex items-center gap-2.5 px-3 py-2 rounded-2xl min-w-[180px] max-w-[260px]',
      isMe ? 'bg-brand-600' : 'bg-surface-hover border border-surface-border'
    )}>
      <button
        onClick={toggle}
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors',
          isMe ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-brand-500/20 hover:bg-brand-500/30 text-brand-400'
        )}
      >
        {isPlaying
          ? <Pause className="w-3.5 h-3.5 fill-current" />
          : <Play  className="w-3.5 h-3.5 fill-current ml-0.5" />
        }
      </button>

      <div className="flex-1 flex flex-col gap-1">
        <div
          className={cn('w-full h-1.5 rounded-full overflow-hidden cursor-pointer', isMe ? 'bg-white/20' : 'bg-surface-border')}
          onClick={seek}
        >
          <div
            className={cn('h-full rounded-full transition-all duration-100', isMe ? 'bg-white' : 'bg-brand-500')}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className={cn('flex justify-between text-[10px]', isMe ? 'text-white/60' : 'text-text-muted')}>
          <span>{formatTime(playPos)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <Mic className={cn('w-3.5 h-3.5 shrink-0', isMe ? 'text-white/60' : 'text-text-muted')} />
    </div>
  )
}
