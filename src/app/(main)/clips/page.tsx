'use client'

import { useState, useRef, useEffect } from 'react'
import { Heart, MessageCircle, Share2, Volume2, VolumeX, Play, ChevronUp, ChevronDown, Rocket, Plus, ArrowLeft } from 'lucide-react'
import { cn, getAvatarUrl } from '@/lib/utils'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { getVideos, toggleVideoLike, incrementVideoView } from '@/lib/actions/videos'
import { VideoUploadModal } from '@/components/clips/VideoUploadModal'
import toast from 'react-hot-toast'

// Demo videos - replace with real data from DB
// const DEMO_VIDEOS = [
//   {
//     id: '1',
//     url: 'https://www.w3schools.com/html/mov_bbb.mp4',
//     thumbnail: '',
//     title: '¿Cómo funciona el Virtual DOM en React?',
//     description: 'Explicación visual de cómo React reconcilia el DOM. #react #frontend #javascript',
//     tags: ['react', 'javascript', 'frontend'],
//     views: 12400,
//     author: { id: '1', username: 'alice', name: 'Alice Dev', image: null },
//     _count: { likes: 843, comments: 56 },
//     liked: false,
//     bookmarked: false,
//   },
//   {
//     id: '2',
//     url: 'https://www.w3schools.com/html/movie.mp4',
//     thumbnail: '',
//     title: 'PostgreSQL Index Explained en 60 segundos',
//     description: 'Optimiza tus queries con índices. Antes vs después. #postgresql #database #backend',
//     tags: ['postgresql', 'database'],
//     views: 8700,
//     author: { id: '2', username: 'bob', name: 'Bob Builder', image: null },
//     _count: { likes: 621, comments: 34 },
//     liked: false,
//     bookmarked: false,
//   },
//   {
//     id: '3',
//     url: 'https://www.w3schools.com/html/mov_bbb.mp4',
//     thumbnail: '',
//     title: 'Rust vs TypeScript: Memory Safety',
//     description: 'Comparativa real de cómo manejan la memoria. #rust #typescript #systemsprogramming',
//     tags: ['rust', 'typescript'],
//     views: 19200,
//     author: { id: '3', username: 'carlos', name: 'Carlos Code', image: null },
//     _count: { likes: 1240, comments: 98 },
//     liked: false,
//     bookmarked: false,
//   },
// ]

interface VideoData {
  id: string
  url: string
  thumbnail: string
  title: string
  description: string
  tags: string[]
  views: number
  author: { id: string; username: string; name: string | null; image: string | null }
  _count: { likes: number; comments: number }
  liked: boolean
  bookmarked: boolean
}

export default function ClipsPage() {
  const { data: session } = useSession()
  const [videos, setVideos] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchVideos = async () => {
    try {
      const data = await getVideos()
      setVideos(data)
    } catch (error) {
      toast.error('Error al cargar clips')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  const goTo = (index: number) => {
    if (index < 0 || index >= videos.length) return
    setCurrentIndex(index)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') goTo(currentIndex + 1)
      if (e.key === 'ArrowUp') goTo(currentIndex - 1)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [currentIndex, videos.length])

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-[50]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-white/50 text-sm font-bold tracking-widest uppercase">Cargando clips...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden z-[50]">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-[60] bg-gradient-to-b from-black/60 to-transparent">
        <Link href="/feed" className="flex items-center gap-2 group text-white/80 hover:text-white transition-all">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-brand-500/20 group-hover:border-brand-500/30 border border-transparent transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight">Cerrar</span>
        </Link>
        <div className="flex items-center gap-4">
          <h1 className="text-white font-black text-lg tracking-tighter uppercase italic opacity-90">DevClips</h1>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Subir Clip
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {videos.length === 0 ? (
          <div className="text-center p-8 max-w-xs">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <Rocket className="w-10 h-10 text-white/20" />
            </div>
            <h3 className="text-white font-bold text-xl mb-2">No hay videos aún</h3>
            <p className="text-white/40 text-sm mb-6">Sé el primero en compartir un clip técnico con la comunidad.</p>
            <button onClick={() => setIsUploadOpen(true)} className="btn-primary w-full py-3">
              Crear primer clip
            </button>
          </div>
        ) : (
          <div className="relative w-full max-w-sm h-full flex items-center">
            {videos.map((video, i) => (
              <VideoCard
                key={video.id}
                video={video}
                active={i === currentIndex}
                currentUserId={session?.user?.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Simple Navigator */}
      {videos.length > 1 && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-[60]">
          <button
            onClick={() => goTo(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-brand-500 hover:border-brand-500 transition-all disabled:opacity-20"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
          <div className="flex flex-col items-center gap-1.5 py-4">
            {videos.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-1 transition-all duration-300 rounded-full",
                  i === currentIndex ? "h-6 bg-brand-500" : "h-1 bg-white/20"
                )}
              />
            ))}
          </div>
          <button
            onClick={() => goTo(currentIndex + 1)}
            disabled={currentIndex === videos.length - 1}
            className="w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-brand-500 hover:border-brand-500 transition-all disabled:opacity-20"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>
      )}

      <VideoUploadModal isOpen={isUploadOpen} onClose={() => { setIsUploadOpen(false); fetchVideos() }} />
    </div>
  )
}

function VideoCard({ video, active, currentUserId }: { video: any; active: boolean; currentUserId?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [liked, setLiked] = useState(video.liked)
  const [likeCount, setLikeCount] = useState(video._count.likes)
  const [progress, setProgress] = useState(0)
  const [hasViewed, setHasViewed] = useState(false)
  const [showHeart, setShowHeart] = useState(false)
  const lastTap = useRef<number>(0)

  useEffect(() => {
    if (!videoRef.current) return
    if (active) {
      videoRef.current.play().then(() => setPlaying(true)).catch(() => { })
      setHasViewed(false)
    } else {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
      setPlaying(false)
    }
  }, [active])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (playing) {
      videoRef.current.pause()
      setPlaying(false)
    } else {
      videoRef.current.play()
      setPlaying(true)
    }
  }

  const handleLike = async () => {
    if (!currentUserId) { toast.error('Inicia sesión para dar like'); return }
    const newLiked = !liked
    setLiked(newLiked)
    setLikeCount((prev: number) => newLiked ? prev + 1 : prev - 1)
    try {
      await toggleVideoLike(video.id)
    } catch {
      setLiked(!newLiked)
      setLikeCount((prev: number) => !newLiked ? prev + 1 : prev - 1)
    }
  }

  const handleDoubleTap = () => {
    const now = Date.now()
    if (now - lastTap.current < 300) {
      if (!liked) handleLike()
      setShowHeart(true)
      setTimeout(() => setShowHeart(false), 800)
    }
    lastTap.current = now
  }

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const v = e.currentTarget
    if (v.duration) {
      setProgress((v.currentTime / v.duration) * 100)
      if (!hasViewed && v.currentTime > 2) {
        setHasViewed(true)
        incrementVideoView(video.id)
      }
    }
  }

  const formatCount = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)

  if (!active) return null

  return (
    <div className="relative w-full h-full flex items-center justify-center animate-fade-in">
      <div className="relative w-full max-w-[360px] aspect-[9/16] bg-black shadow-[0_0_100px_-20px_rgba(34,197,94,0.3)] rounded-[2.5rem] overflow-hidden border border-white/10 group">
        <div className="w-full h-full relative" onClick={handleDoubleTap}>
          <video
            ref={videoRef}
            src={video.url}
            className="w-full h-full object-cover cursor-pointer"
            loop
            muted={muted}
            playsInline
            onTimeUpdate={handleTimeUpdate}
          />
          {showHeart && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 animate-heart-pop">
              <Heart className="w-24 h-24 text-red-500 fill-red-500 drop-shadow-2xl" />
            </div>
          )}
        </div>

        {/* Glossy Overlay UI */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/20 via-transparent to-black/80" />

        {/* Progress Bar Top */}
        <div className="absolute top-0 left-0 right-0 h-1 z-20">
          <div className="h-full bg-brand-500 transition-all duration-100 ease-linear shadow-[0_0_12px_rgba(34,197,94,0.8)]" style={{ width: `${progress}%` }} />
        </div>

        {/* Center Play Indicator */}
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center cursor-pointer pointer-events-auto" onClick={togglePlay}>
            <div className="w-20 h-20 rounded-full bg-black/20 backdrop-blur-xl flex items-center justify-center border border-white/10 animate-pulse">
              <Play className="w-8 h-8 text-white fill-white ml-1" />
            </div>
          </div>
        )}

        {/* Bottom Info Section */}
        <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 pb-10">
          <div className="flex flex-col gap-3">
            <Link href={`/profile/${video.author.username}`} className="flex items-center gap-3 pointer-events-auto group/author">
              <div className="relative">
                <img
                  src={video.author.image ?? getAvatarUrl(video.author.username)}
                  alt=""
                  className="w-12 h-12 rounded-full border-2 border-brand-500 p-0.5 object-cover"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center border-2 border-black">
                  <Plus className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-sm tracking-tight drop-shadow-lg group-hover/author:text-brand-400 transition-colors">@{video.author.username}</span>
                <span className="text-white/60 text-[11px] font-medium uppercase tracking-widest">{video.author.name || 'Developer'}</span>
              </div>
            </Link>

            <div className="space-y-2">
              <h4 className="text-white font-bold text-base leading-tight drop-shadow-md line-clamp-2">{video.title}</h4>
              <p className="text-white/70 text-xs line-clamp-2 drop-shadow leading-relaxed">{video.description}</p>
            </div>

            <div className="flex flex-wrap gap-2 pointer-events-auto">
              {video.tags && video.tags.map((tag: string) => (
                <span key={tag} className="px-2 py-0.5 rounded-md bg-white/10 backdrop-blur text-[10px] text-brand-300 font-bold uppercase tracking-wider border border-white/5 cursor-pointer hover:bg-brand-500 hover:text-white transition-all">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Side Actions Overlay */}
        <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6 z-30 pointer-events-auto">
          <button onClick={handleLike} className="group/action flex flex-col items-center gap-1.5 focus:outline-none">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 bubble",
              liked ? "bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]" : "bg-white/10 backdrop-blur-xl border border-white/10 hover:border-white/30"
            )}>
              <Heart className={cn("w-6 h-6 transition-transform duration-300", liked ? "fill-white text-white scale-110" : "text-white group-hover/action:scale-110")} />
            </div>
            <span className="text-white text-xs font-bold drop-shadow-md">{formatCount(likeCount)}</span>
          </button>

          <button className="group/action flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white group-hover/action:scale-110 transition-transform" />
            </div>
            <span className="text-white text-xs font-bold drop-shadow-md">{formatCount(video._count?.comments || 0)}</span>
          </button>

          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/clips/${video.id}`)
              toast.success('¡Enlace de DevClip copiado!')
            }}
            className="group/action flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity"
          >
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center">
              <Share2 className="w-6 h-6 text-white group-hover/action:scale-110 transition-transform" />
            </div>
            <span className="text-white text-[10px] font-bold uppercase tracking-widest drop-shadow-md">Share</span>
          </button>

          <button
            onClick={() => setMuted(!muted)}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center mt-4"
          >
            {muted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
          </button>
        </div>
      </div>
    </div>
  )
}
