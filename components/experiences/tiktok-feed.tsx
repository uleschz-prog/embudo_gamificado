"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Heart,
  MessageCircle,
  Share2,
  Music2,
  Plus,
  Home,
  Search,
  User,
  X,
  Volume2,
  VolumeX,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { openWhatsAppGroupInvite } from "@/lib/whatsapp-invite"

interface Comment {
  id: number
  username: string
  avatar: string
  text: string
  likes: string
  time: string
}

const FAKE_COMMENTS: Comment[] = [
  {
    id: 1,
    username: "carlos_martinez99",
    avatar: "/images/logo.png",
    text: "Esto me abrió los ojos... nunca lo había visto así",
    likes: "2.4K",
    time: "2h",
  },
  {
    id: 2,
    username: "ana.digital",
    avatar: "/images/logo.png",
    text: "Llevo 3 semanas aplicando esto y ya veo resultados",
    likes: "1.8K",
    time: "4h",
  },
  {
    id: 3,
    username: "emprendedor_mx",
    avatar: "/images/logo.png",
    text: "El mejor contenido que he visto en mucho tiempo",
    likes: "956",
    time: "6h",
  },
  {
    id: 4,
    username: "lucia_fernandez",
    avatar: "/images/logo.png",
    text: "Necesito más información, dónde puedo aprender más?",
    likes: "743",
    time: "8h",
  },
  {
    id: 5,
    username: "mindset_warrior",
    avatar: "/images/logo.png",
    text: "Esto es exactamente lo que necesitaba escuchar hoy",
    likes: "512",
    time: "12h",
  },
]

interface VideoItem {
  id: number
  overlayText: string
  description: string
  /** Si existe, reemplaza el titular verde por video a pantalla completa (coloca el archivo en public/videos/…) */
  videoSrc?: string
  poster?: string
  backgroundImage?: string
  audioSrc?: string
}

interface TikTokFeedProps {
  onComplete: () => void
}

const VIDEOS: VideoItem[] = [
  {
    id: 1,
    overlayText: "NO ES ENERGÍA",
    description: "Te mantuvieron funcional, no óptimo.",
    videoSrc: "/videos/feed-1.mp4",
  },
  {
    id: 2,
    overlayText: "DEPENDENCIA DISEÑADA",
    description: "El sistema necesita que dependas de él.",
  },
  {
    id: 3,
    overlayText: "ERROR DE SISTEMA",
    description: "Lo que creías normal... es programación.",
  },
  {
    id: 4,
    overlayText: "LEE ESTO",
    description: "Aquí no reclutas… te posicionas. Aquí no dependes… operas.",
  },
]

export function TikTokFeed({ onComplete }: TikTokFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showGlitch, setShowGlitch] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const reelVideoRef = useRef<HTMLVideoElement>(null)
  const startY = useRef(0)
  const [likes, setLikes] = useState<Record<number, boolean>>({})
  const [reelVideoFailed, setReelVideoFailed] = useState(false)
  /** Autoplay exige muted; el usuario activa audio con el botón (gesto explícito). */
  const [reelMuted, setReelMuted] = useState(true)

  const safeIndex =
    VIDEOS.length === 0 ? 0 : Math.min(Math.max(0, currentIndex), VIDEOS.length - 1)
  const currentVideo = VIDEOS[safeIndex]
  const showReelVideo = Boolean(currentVideo?.videoSrc) && !reelVideoFailed

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endY = e.changedTouches[0].clientY
    const diff = startY.current - endY

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        const onFirstVideoReel =
          safeIndex === 0 && Boolean(VIDEOS[0]?.videoSrc) && showReelVideo
        if (onFirstVideoReel) {
          openWhatsAppGroupInvite()
          return
        }
        if (currentIndex < VIDEOS.length - 1) {
          setShowGlitch(true)
          setTimeout(() => {
            setCurrentIndex((prev) => Math.min(prev + 1, VIDEOS.length - 1))
            setShowGlitch(false)
          }, 150)
        }
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe down
        setShowGlitch(true)
        setTimeout(() => {
          setCurrentIndex((prev) => Math.max(prev - 1, 0))
          setShowGlitch(false)
        }, 150)
      }
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 30) {
      const onFirstVideoReel =
        safeIndex === 0 && Boolean(VIDEOS[0]?.videoSrc) && showReelVideo
      if (onFirstVideoReel) {
        openWhatsAppGroupInvite()
        return
      }
      if (currentIndex < VIDEOS.length - 1) {
        setShowGlitch(true)
        setTimeout(() => {
          setCurrentIndex((prev) => Math.min(prev + 1, VIDEOS.length - 1))
          setShowGlitch(false)
        }, 150)
      }
    } else if (e.deltaY < -30 && currentIndex > 0) {
      setShowGlitch(true)
      setTimeout(() => {
        setCurrentIndex((prev) => Math.max(prev - 1, 0))
        setShowGlitch(false)
      }, 150)
    }
  }

  const toggleLike = (videoId: number) => {
    setLikes((prev) => ({ ...prev, [videoId]: !prev[videoId] }))
  }

  // Auto-advance and complete after viewing all
  useEffect(() => {
    if (currentIndex === VIDEOS.length - 1) {
      const timeout = setTimeout(onComplete, 5000)
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, onComplete])

  useEffect(() => {
    if (VIDEOS.length === 0) return
    if (currentIndex !== safeIndex) setCurrentIndex(safeIndex)
  }, [currentIndex, safeIndex, VIDEOS.length])

  useEffect(() => {
    setReelVideoFailed(false)
  }, [currentIndex])

  useEffect(() => {
    if (!showReelVideo || !currentVideo?.videoSrc) return
    const v = reelVideoRef.current
    if (!v) return
    v.currentTime = 0
    v.muted = reelMuted
    void v.play().catch(() => {})
  }, [currentIndex, showReelVideo, currentVideo?.videoSrc])

  useEffect(() => {
    if (!showReelVideo || !currentVideo?.videoSrc) return
    const v = reelVideoRef.current
    if (!v) return
    v.muted = reelMuted
    void v.play().catch(() => {})
  }, [reelMuted, showReelVideo, currentVideo?.videoSrc])

  const toggleReelSound = useCallback(() => {
    setReelMuted((m) => !m)
  }, [])

  const activateReelSound = useCallback(() => {
    setReelMuted(false)
  }, [])

  if (!VIDEOS.length || !currentVideo) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center bg-background text-muted-foreground">
        Sin reels configurados
      </div>
    )
  }

  const onReelVideo = showReelVideo

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-dvh max-h-dvh w-full overflow-hidden",
        onReelVideo ? "bg-black" : "bg-background"
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* Capa principal: video a todo el viewport (estilo TikTok) */}
      <div
        className={cn("absolute inset-0 z-0", showGlitch && "animate-glitch")}
        onClick={() => {
          if (onReelVideo && reelMuted) activateReelSound()
        }}
      >
        {showReelVideo && currentVideo.videoSrc ? (
          <>
            <video
              key={currentVideo.id}
              ref={reelVideoRef}
              className="absolute inset-0 z-0 h-full w-full object-cover object-center"
              src={currentVideo.videoSrc}
              poster={currentVideo.poster ?? "/images/logo.png"}
              playsInline
              muted={reelMuted}
              loop
              autoPlay
              preload="auto"
              onError={() => setReelVideoFailed(true)}
            />
            {/* Lectura tipo TikTok: más contraste abajo + viñeta suave arriba */}
            <div
              className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/35 via-transparent to-black/80"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/55 via-transparent to-transparent"
              aria-hidden
            />
          </>
        ) : (
          <div className="absolute inset-0 z-0 bg-background" aria-hidden />
        )}

        {/* Grano muy leve en video; más marcado en reels solo texto */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-[2] animate-noise",
            onReelVideo ? "opacity-[0.035]" : "opacity-10"
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 200px",
          }}
        />

        {!showReelVideo ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
            <h1 className="break-words text-4xl font-bold tracking-tight text-primary">
              {currentVideo.overlayText}
            </h1>
            <div className="mt-4 h-px w-16 bg-primary/50" />
          </div>
        ) : null}

        {onReelVideo && reelMuted ? (
          <button
            type="button"
            className="absolute left-4 top-4 z-10 rounded-full border border-white/30 bg-black/45 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation()
              activateReelSound()
            }}
          >
            Toca para activar sonido
          </button>
        ) : null}

        {!onReelVideo ? (
          <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden">
            <div className="animate-scanline absolute left-0 right-0 h-px bg-primary/30" />
          </div>
        ) : null}
      </div>

      {/* Right sidebar */}
      <div className="absolute bottom-24 right-3 z-20 flex flex-col items-center gap-6 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
        {/* Profile */}
        <div className="relative">
          <div
            className={cn(
              "h-12 w-12 overflow-hidden rounded-full border-2",
              onReelVideo ? "border-white" : "border-foreground"
            )}
          >
            <img 
              src="/images/logo.png" 
              alt="Asesor Raiz"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-2 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full bg-primary">
            <Plus className="h-3 w-3 text-primary-foreground" />
          </div>
        </div>

        {/* Like */}
        <button
          onClick={() => toggleLike(currentVideo.id)}
          className="flex flex-col items-center gap-1"
        >
          <Heart
            className={cn(
              "h-8 w-8",
              likes[currentVideo.id]
                ? "fill-destructive text-destructive"
                : onReelVideo
                  ? "text-white"
                  : "text-foreground"
            )}
          />
          <span
            className={cn(
              "text-xs",
              onReelVideo ? "text-white" : "text-foreground"
            )}
          >
            {likes[currentVideo.id] ? "1.3K" : "1.2K"}
          </span>
        </button>

        {/* Comments */}
        <button 
          onClick={() => setShowComments(true)}
          className="flex flex-col items-center gap-1"
        >
          <MessageCircle
            className={cn("h-8 w-8", onReelVideo ? "text-white" : "text-foreground")}
          />
          <span className={cn("text-xs", onReelVideo ? "text-white" : "text-foreground")}>
            248
          </span>
        </button>

        {/* Share */}
        <button className="flex flex-col items-center gap-1">
          <Share2
            className={cn("h-8 w-8", onReelVideo ? "text-white" : "text-foreground")}
          />
          <span className={cn("text-xs", onReelVideo ? "text-white" : "text-foreground")}>
            Share
          </span>
        </button>

        {/* Sonido: toca para quitar silencio (política del navegador) */}
        {onReelVideo ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              toggleReelSound()
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/25 backdrop-blur-sm transition-transform active:scale-95"
            aria-label={reelMuted ? "Activar sonido" : "Silenciar"}
          >
            {reelMuted ? (
              <VolumeX className="h-5 w-5 text-white" />
            ) : (
              <Volume2 className="h-5 w-5 text-white" />
            )}
          </button>
        ) : (
          <div
            className="flex h-10 w-10 animate-spin items-center justify-center rounded-full border border-border bg-card"
            style={{ animationDuration: "3s" }}
          >
            <Music2 className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-20 left-0 right-16 z-20 p-4 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <img 
              src="/images/logo.png" 
              alt="Asesor Raiz"
              className="h-8 w-8 rounded-full object-cover ring-2 ring-white/20"
            />
            <span
              className={cn(
                "font-semibold",
                onReelVideo ? "text-white" : "text-foreground"
              )}
            >
              @asesor.raiz
            </span>
          </div>
          <p
            className={cn(
              "break-words text-sm",
              onReelVideo ? "text-white/95" : "text-foreground/90"
            )}
          >
            {currentVideo.description}
          </p>
          <div className="flex items-center gap-2">
            <Music2
              className={cn("h-3 w-3", onReelVideo ? "text-white" : "text-foreground")}
            />
            <span
              className={cn(
                "text-xs",
                onReelVideo ? "text-white/75" : "text-foreground/70"
              )}
            >
              Original Sound - Asesor Raiz
            </span>
          </div>
        </div>
      </div>

      {/* Video indicator */}
      <div className="absolute right-3 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-1">
        {VIDEOS.map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-1 w-1 rounded-full transition-all",
              index === safeIndex
                ? "h-3 bg-primary"
                : onReelVideo
                  ? "bg-white/35"
                  : "bg-muted-foreground/50"
            )}
          />
        ))}
      </div>

      {/* Bottom navigation */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t py-2 backdrop-blur-md",
          onReelVideo
            ? "border-white/10 bg-black/45"
            : "border-border bg-background/80"
        )}
      >
        <button className="flex flex-col items-center gap-0.5">
          <Home
            className={cn("h-6 w-6", onReelVideo ? "text-white" : "text-foreground")}
          />
          <span
            className={cn(
              "text-[10px]",
              onReelVideo ? "text-white" : "text-foreground"
            )}
          >
            Inicio
          </span>
        </button>
        <button className="flex flex-col items-center gap-0.5">
          <Search
            className={cn(
              "h-6 w-6",
              onReelVideo ? "text-white/55" : "text-muted-foreground"
            )}
          />
          <span
            className={cn(
              "text-[10px]",
              onReelVideo ? "text-white/55" : "text-muted-foreground"
            )}
          >
            Buscar
          </span>
        </button>
        <button className="flex h-8 w-12 items-center justify-center rounded-lg bg-primary">
          <Plus className="h-5 w-5 text-primary-foreground" />
        </button>
        <button className="flex flex-col items-center gap-0.5">
          <MessageCircle
            className={cn(
              "h-6 w-6",
              onReelVideo ? "text-white/55" : "text-muted-foreground"
            )}
          />
          <span
            className={cn(
              "text-[10px]",
              onReelVideo ? "text-white/55" : "text-muted-foreground"
            )}
          >
            Inbox
          </span>
        </button>
        <button className="flex flex-col items-center gap-0.5">
          <User
            className={cn(
              "h-6 w-6",
              onReelVideo ? "text-white/55" : "text-muted-foreground"
            )}
          />
          <span
            className={cn(
              "text-[10px]",
              onReelVideo ? "text-white/55" : "text-muted-foreground"
            )}
          >
            Perfil
          </span>
        </button>
      </div>

      {/* Swipe hint */}
      {safeIndex < VIDEOS.length - 1 && (
        <div className="absolute bottom-28 left-1/2 z-20 -translate-x-1/2 animate-bounce">
          <svg
            className={cn(
              "h-6 w-6 rotate-180",
              onReelVideo ? "text-white/70" : "text-muted-foreground"
            )}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </div>
      )}

      {/* Comments Modal */}
      {showComments && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
          onClick={() => setShowComments(false)}
        >
          <div 
            className="w-full max-w-lg rounded-t-2xl bg-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-4">
              <span className="text-sm text-muted-foreground">248 comentarios</span>
              <button 
                onClick={() => setShowComments(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Comments list */}
            <div className="max-h-[60vh] overflow-y-auto p-4">
              <div className="flex flex-col gap-4">
                {FAKE_COMMENTS.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full">
                      <img 
                        src={comment.avatar} 
                        alt={comment.username}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {comment.username}
                        </span>
                        <span className="text-xs text-muted-foreground">{comment.time}</span>
                      </div>
                      <p className="text-sm text-foreground/90">{comment.text}</p>
                      <div className="flex items-center gap-4 pt-1">
                        <button className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Heart className="h-3 w-3" />
                          <span>{comment.likes}</span>
                        </button>
                        <button className="text-xs text-muted-foreground">Responder</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input area */}
            <div className="flex items-center gap-3 border-t border-border p-4">
              <div className="h-8 w-8 overflow-hidden rounded-full">
                <img 
                  src="/images/logo.png" 
                  alt="Tu perfil"
                  className="h-full w-full object-cover"
                />
              </div>
              <input
                type="text"
                placeholder="Escribe un comentario..."
                className="flex-1 rounded-full bg-muted px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
