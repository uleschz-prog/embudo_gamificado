"use client"

import { useState, useEffect } from "react"
import { Lock, Play } from "lucide-react"

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
      const timeout = setTimeout(onComplete, 2000)
      return () => clearTimeout(timeout)
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
          {/* Video player placeholder */}
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-primary/30 bg-card">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                <Play className="h-8 w-8 text-primary" fill="currentColor" />
              </div>
            </div>
            {/* Glitch effect */}
            <div className="animate-glitch pointer-events-none absolute inset-0 bg-primary/5" />
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            ARCHIVO_RESTRINGIDO.mp4
          </span>
        </div>
      )}
    </div>
  )
}
