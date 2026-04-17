"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Phone, PhoneOff, User } from "lucide-react"

interface IncomingCallProps {
  onComplete: () => void
}

export function IncomingCall({ onComplete }: IncomingCallProps) {
  const [callState, setCallState] = useState<"incoming" | "active" | "ending">("incoming")
  const [timer, setTimer] = useState(0)
  const [showGlitch, setShowGlitch] = useState(false)
  const [needsAudioUnlock, setNeedsAudioUnlock] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const incomingRingtoneRef = useRef<HTMLAudioElement | null>(null)

  // Play ringtone during incoming state
  useEffect(() => {
    if (callState === "incoming") {
      incomingRingtoneRef.current = new Audio("/audio/notificacion.mp3")
      incomingRingtoneRef.current.loop = true
      void incomingRingtoneRef.current.play().then(
        () => setNeedsAudioUnlock(false),
        () => setNeedsAudioUnlock(true),
      )
    }

    return () => {
      if (incomingRingtoneRef.current) {
        incomingRingtoneRef.current.pause()
        incomingRingtoneRef.current = null
      }
    }
  }, [callState])

  // Play audio when call becomes active
  useEffect(() => {
    if (callState === "active") {
      // Stop incoming ringtone
      if (incomingRingtoneRef.current) {
        incomingRingtoneRef.current.pause()
        incomingRingtoneRef.current = null
      }
      // Play call audio
      audioRef.current = new Audio("/audio/notificacion.mp3")
      void audioRef.current.play().catch(() => setNeedsAudioUnlock(true))
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [callState])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }, [])

  useEffect(() => {
    if (callState !== "active") return

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev >= 45) {
          clearInterval(interval)
          setCallState("ending")
          return prev
        }
        return prev + 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [callState])

  useEffect(() => {
    if (callState !== "ending") return

    setShowGlitch(true)
    const timeout = setTimeout(() => {
      onComplete()
    }, 2000)

    return () => clearTimeout(timeout)
  }, [callState, onComplete])

  const handleAccept = () => {
    setCallState("active")
    setTimer(0)
  }

  const handleReject = () => {
    onComplete()
  }

  const unlockCallAudio = () => {
    if (callState === "incoming") {
      const a = incomingRingtoneRef.current
      if (a) void a.play().then(() => setNeedsAudioUnlock(false), () => setNeedsAudioUnlock(true))
    } else if (callState === "active") {
      const a = audioRef.current
      if (a) void a.play().then(() => setNeedsAudioUnlock(false), () => setNeedsAudioUnlock(true))
    }
  }

  return (
    <div className={`relative flex min-h-dvh w-full flex-col items-center justify-between overflow-hidden bg-[#0a0a0a] ${showGlitch ? "animate-glitch" : ""}`}>
      {/* Green line accent at top */}
      <div className="absolute left-0 right-0 top-[180px] h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      
      {/* Top section */}
      <div className="z-10 flex flex-col items-center gap-2 pt-10">
        <span className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Llamada entrante
        </span>
        {needsAudioUnlock && (callState === "incoming" || callState === "active") ? (
          <button
            type="button"
            onClick={unlockCallAudio}
            className="rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-medium text-primary backdrop-blur-sm transition hover:bg-primary/20"
          >
            Toca para activar el sonido
          </button>
        ) : null}
        {callState === "active" && (
          <span className="font-mono text-2xl tabular-nums text-primary">
            {formatTime(timer)}
          </span>
        )}
      </div>

      {/* Center section - Avatar */}
      <div className="z-10 flex flex-col items-center gap-8">
        {/* Pulsing avatar with concentric rings */}
        <div className="relative flex items-center justify-center">
          {/* Outer rings */}
          {callState === "incoming" && (
            <>
              <div 
                className="absolute h-44 w-44 rounded-full border border-primary/20"
                style={{ animation: "pulse-ring 2s ease-out infinite" }}
              />
              <div 
                className="absolute h-36 w-36 rounded-full border border-primary/30"
                style={{ animation: "pulse-ring 2s ease-out infinite", animationDelay: "0.5s" }}
              />
            </>
          )}
          {/* Static ring */}
          <div className="absolute h-32 w-32 rounded-full border-2 border-primary/50" />
          
          {/* Avatar circle */}
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#1a1a1a]">
            <User className="h-14 w-14 text-muted-foreground" strokeWidth={1.5} />
          </div>
        </div>

        {/* Contact info */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-medium text-foreground">
            Numero desconocido
          </h1>
          <span className="text-base text-muted-foreground">
            Linea segura
          </span>
        </div>

        {/* Audio waves when call is active */}
        {callState === "active" && (
          <div className="flex items-center gap-1">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="w-1 rounded-full bg-primary"
                style={{
                  height: "4px",
                  animation: `audio-wave 0.5s ease-in-out infinite`,
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom section - Action buttons */}
      <div className="z-10 flex w-full max-w-xs items-center justify-center gap-20 pb-16">
        {callState === "incoming" && (
          <>
            <button
              onClick={handleReject}
              className="flex h-18 w-18 items-center justify-center rounded-full bg-[#dc2626] transition-transform hover:scale-105 active:scale-95"
              style={{ width: "72px", height: "72px" }}
            >
              <PhoneOff className="h-7 w-7 text-white" />
              <span className="sr-only">Rechazar llamada</span>
            </button>
            <button
              onClick={handleAccept}
              className="flex h-18 w-18 items-center justify-center rounded-full bg-[#22c55e] transition-transform hover:scale-105 active:scale-95"
              style={{ width: "72px", height: "72px" }}
            >
              <Phone className="h-7 w-7 text-white" />
              <span className="sr-only">Aceptar llamada</span>
            </button>
          </>
        )}
        {callState === "active" && (
          <button
            onClick={() => setCallState("ending")}
            className="flex items-center justify-center rounded-full bg-[#dc2626] transition-transform hover:scale-105 active:scale-95"
            style={{ width: "72px", height: "72px" }}
          >
            <PhoneOff className="h-7 w-7 text-white" />
            <span className="sr-only">Finalizar llamada</span>
          </button>
        )}
      </div>

      {/* Glitch overlay when ending */}
      {showGlitch && (
        <div className="absolute inset-0 z-20 bg-background/90 backdrop-blur-sm transition-opacity duration-1000" />
      )}
    </div>
  )
}
