"use client"

import { useState, useEffect, useRef } from "react"
import { Lock } from "lucide-react"
import { medios } from "@/lib/medios"

interface HackerPlayerProps {
  onComplete: () => void
}

const PHASES = [
  { text: "Autenticando identidad…", progress: 0, duration: 3000 },
  { text: "Acceso a archivo restringido", progress: 48, duration: 3000 },
  { text: "Reproduciendo…", progress: 100, duration: 4000 },
]

export function HackerPlayer({ onComplete }: HackerPlayerProps) {
  const [currentPhase, setCurrentPhase] = useState(0)
  const [showCursor, setShowCursor] = useState(true)
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const [showPlayer, setShowPlayer] = useState(false)
  const didCompleteRef = useRef(false)

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  // Phase progression
  useEffect(() => {
    if (currentPhase >= PHASES.length) {
      setShowPlayer(true)
      return
    }

    const phase = PHASES[currentPhase]
    
    // Animate progress
    const targetProgress = phase.progress
    const startProgress = currentPhase > 0 ? PHASES[currentPhase - 1].progress : 0
    const progressDuration = 1500
    const progressStep = (targetProgress - startProgress) / (progressDuration / 16)
    
    let currentProgress = startProgress
    const progressInterval = setInterval(() => {
      currentProgress += progressStep
      if (currentProgress >= targetProgress) {
        currentProgress = targetProgress
        clearInterval(progressInterval)
      }
      setAnimatedProgress(currentProgress)
    }, 16)

    const phaseTimeout = setTimeout(() => {
      setCurrentPhase((prev) => prev + 1)
    }, phase.duration)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(phaseTimeout)
    }
  }, [currentPhase, onComplete])

  const handleContinue = () => {
    if (didCompleteRef.current) return
    didCompleteRef.current = true
    onComplete()
  }

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-background p-6">
      {/* Scanline */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-scanline absolute left-0 right-0 h-px bg-primary/20" />
      </div>

      {!showPlayer ? (
        <div className="z-10 flex w-full max-w-md flex-col items-center gap-8">
          {/* Lock icon */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-primary/30 bg-card">
            <Lock className="h-10 w-10 text-primary" />
          </div>

          {/* Progress bar */}
          <div className="flex w-full flex-col gap-2">
            <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${animatedProgress}%` }}
              />
            </div>
            <span className="text-center font-mono text-xs text-muted-foreground">
              {Math.round(animatedProgress)}%
            </span>
          </div>

          {/* Current phase text */}
          <div className="font-mono">
            <p className="break-words text-center text-primary">
              {currentPhase < PHASES.length ? PHASES[currentPhase].text : ""}
              <span className={`ml-0.5 inline-block h-4 w-2 bg-primary ${showCursor ? "opacity-100" : "opacity-0"}`} />
            </p>
          </div>
        </div>
      ) : (
        <div className="z-10 flex w-full max-w-md flex-col items-center gap-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-primary/30 bg-card">
            <video
              className="h-full w-full object-cover"
              src={medios.videoVsl}
              controls
              playsInline
              preload="auto"
              onEnded={handleContinue}
            />
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            manifiesto_raiz.mp4
          </span>
          <button
            type="button"
            onClick={handleContinue}
            className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20"
          >
            Continuar
          </button>
        </div>
      )}
    </div>
  )
}
