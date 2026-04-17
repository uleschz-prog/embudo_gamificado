"use client"

import { useState, useEffect } from "react"

interface HackerScannerProps {
  onComplete: () => void
}

const PHASES = [
  { progress: 0, text: "Inicializando escaneo de patrón…", duration: 3000 },
  { progress: 23, text: "Analizando fatiga cognitiva…", duration: 3000 },
  { progress: 57, text: "Detectando dependencia estructural…", duration: 3000 },
  { progress: 100, text: "Patrón identificado", duration: 2000 },
]

export function HackerScanner({ onComplete }: HackerScannerProps) {
  const [currentPhase, setCurrentPhase] = useState(0)
  const [displayedText, setDisplayedText] = useState("")
  const [showCursor, setShowCursor] = useState(true)
  const [animatedProgress, setAnimatedProgress] = useState(0)

  // Cursor blink effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  // Phase progression
  useEffect(() => {
    if (currentPhase >= PHASES.length) {
      const timeout = setTimeout(onComplete, 1500)
      return () => clearTimeout(timeout)
    }

    const phase = PHASES[currentPhase]
    
    // Typing effect
    let charIndex = 0
    setDisplayedText("")
    
    const typingInterval = setInterval(() => {
      if (charIndex < phase.text.length) {
        setDisplayedText(phase.text.slice(0, charIndex + 1))
        charIndex++
      } else {
        clearInterval(typingInterval)
      }
    }, 40)

    // Progress animation
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

    // Move to next phase
    const phaseTimeout = setTimeout(() => {
      setCurrentPhase((prev) => prev + 1)
    }, phase.duration)

    return () => {
      clearInterval(typingInterval)
      clearInterval(progressInterval)
      clearTimeout(phaseTimeout)
    }
  }, [currentPhase, onComplete])

  return (
    <div className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-background p-6">
      {/* Scanline effect */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-scanline absolute left-0 right-0 h-px bg-primary/20" />
      </div>

      {/* Terminal content */}
      <div className="z-10 flex w-full max-w-md flex-col gap-8">
        {/* Progress bar */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
            <span>SCAN_PROGRESS</span>
            <span>{Math.round(animatedProgress)}%</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${animatedProgress}%` }}
            />
          </div>
        </div>

        {/* Terminal text */}
        <div className="font-mono">
          <div className="flex items-start gap-2">
            <span className="text-primary">{">"}</span>
            <p className="break-words text-primary">
              {displayedText}
              <span className={`ml-0.5 inline-block h-4 w-2 bg-primary ${showCursor ? "opacity-100" : "opacity-0"}`} />
            </p>
          </div>
        </div>

        {/* Previous phases */}
        <div className="flex flex-col gap-2 font-mono text-sm text-muted-foreground">
          {PHASES.slice(0, currentPhase).map((phase, index) => (
            <div key={index} className="flex items-start gap-2 opacity-50">
              <span className="text-primary/50">{">"}</span>
              <span className="break-words">{phase.text}</span>
              <span className="ml-auto text-primary/50">[OK]</span>
            </div>
          ))}
        </div>
      </div>

      {/* Glitch overlay on completion */}
      {currentPhase >= PHASES.length && (
        <div className="animate-glitch absolute inset-0 z-20 bg-background/80" />
      )}
    </div>
  )
}
