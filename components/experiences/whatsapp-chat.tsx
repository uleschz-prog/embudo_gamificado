"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, MoreVertical, Phone, Video, Play, Pause } from "lucide-react"

interface Message {
  id: number
  text?: string
  audioSrc?: string
  audioDuration?: string
  isUser?: boolean
  delay: number
  waitForAudioEnd?: boolean
}

interface WhatsAppChatProps {
  contactName: string
  contactImage?: string
  messages: Message[]
  onComplete: () => void
  enableInput?: boolean
  inputTrigger?: string
  options?: { id: string; label: string }[]
  onOptionSelect?: (optionId: string) => void
}

// Audio message component with WhatsApp-style waveform
function AudioMessage({ 
  audioSrc, 
  duration, 
  contactImage,
  onAudioEnd 
}: { 
  audioSrc: string
  duration: string
  contactImage?: string
  onAudioEnd?: () => void 
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [hasEnded, setHasEnded] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const togglePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(audioSrc)
      audioRef.current.addEventListener("timeupdate", () => {
        if (audioRef.current) {
          const prog = (audioRef.current.currentTime / audioRef.current.duration) * 100
          setProgress(prog)
        }
      })
      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false)
        setProgress(100)
        if (!hasEnded) {
          setHasEnded(true)
          onAudioEnd?.()
        }
      })
    }

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  // Generate random waveform bars
  const waveformBars = Array.from({ length: 28 }, () => 
    Math.random() * 0.7 + 0.3
  )

  return (
    <div className="flex items-center gap-2">
      {/* Play button */}
      <button
        onClick={togglePlay}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary transition-colors hover:bg-primary/30"
      >
        {isPlaying ? (
          <Pause className="h-5 w-5" fill="currentColor" />
        ) : (
          <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
        )}
      </button>

      {/* Waveform and progress */}
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex h-6 items-end gap-[2px]">
          {waveformBars.map((height, i) => {
            const isActive = (i / waveformBars.length) * 100 <= progress
            return (
              <div
                key={i}
                className={`w-[3px] rounded-full transition-colors ${
                  isActive ? "bg-primary" : "bg-muted-foreground/40"
                }`}
                style={{ height: `${height * 100}%` }}
              />
            )
          })}
        </div>
        <span className="text-[10px] text-muted-foreground">{duration}</span>
      </div>

      {/* Avatar */}
      {contactImage && (
        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full">
          <img src={contactImage} alt="Avatar" className="h-full w-full object-cover" />
        </div>
      )}
    </div>
  )
}

export function WhatsAppChat({
  contactName,
  contactImage,
  messages,
  onComplete,
  enableInput = false,
  inputTrigger,
  options,
  onOptionSelect,
}: WhatsAppChatProps) {
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [allMessagesShown, setAllMessagesShown] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [waitingForAudio, setWaitingForAudio] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentMessageIndex = useRef(0)

  const handleAudioEnd = () => {
    setWaitingForAudio(false)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [visibleMessages, isTyping])

  useEffect(() => {
    // If waiting for audio to finish, don't show next message
    if (waitingForAudio) return

    if (currentMessageIndex.current >= messages.length) {
      setAllMessagesShown(true)
      if (!enableInput && !options) {
        const timeout = setTimeout(onComplete, 2000)
        return () => clearTimeout(timeout)
      }
      return
    }

    const message = messages[currentMessageIndex.current]
    
    // Show typing indicator
    setIsTyping(true)
    
    const typingTimeout = setTimeout(() => {
      setIsTyping(false)
      setVisibleMessages((prev) => [...prev, message])
      currentMessageIndex.current++
      
      // If this message has waitForAudioEnd, pause until audio finishes
      if (message.waitForAudioEnd && message.audioSrc) {
        setWaitingForAudio(true)
      }
    }, message.delay)

    return () => clearTimeout(typingTimeout)
  }, [visibleMessages.length, messages, onComplete, enableInput, options, waitingForAudio])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputTrigger && inputValue.toUpperCase() === inputTrigger.toUpperCase()) {
      setVisibleMessages((prev) => [
        ...prev,
        { id: Date.now(), text: inputValue, isUser: true, delay: 0 },
      ])
      setInputValue("")
      setTimeout(onComplete, 1000)
    }
  }

  const handleOptionClick = (optionId: string, label: string) => {
    if (selectedOption) return
    setSelectedOption(optionId)
    setVisibleMessages((prev) => [
      ...prev,
      { id: Date.now(), text: label, isUser: true, delay: 0 },
    ])
    if (onOptionSelect) {
      onOptionSelect(optionId)
    }
  }

  return (
    <div className="flex h-full w-full flex-col bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <button className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        {contactImage ? (
          <img 
            src={contactImage} 
            alt={contactName}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
            <span className="text-sm font-semibold text-primary">{contactName.charAt(0)}</span>
          </div>
        )}
        <div className="flex flex-1 flex-col">
          <span className="text-sm font-semibold text-foreground">{contactName}</span>
          <span className="text-xs text-muted-foreground">en línea</span>
        </div>
        <div className="flex items-center gap-4 text-muted-foreground">
          <Video className="h-5 w-5" />
          <Phone className="h-5 w-5" />
          <MoreVertical className="h-5 w-5" />
        </div>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-2">
          {visibleMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] break-words rounded-lg px-3 py-2 text-sm ${
                  message.isUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-card-foreground"
                } ${message.audioSrc ? "min-w-[240px]" : ""}`}
              >
                {message.audioSrc ? (
                  <AudioMessage 
                    audioSrc={message.audioSrc} 
                    duration={message.audioDuration || "0:00"}
                    contactImage={!message.isUser ? contactImage : undefined}
                    onAudioEnd={message.waitForAudioEnd ? handleAudioEnd : undefined}
                  />
                ) : (
                  message.text
                )}
                <div className={`mt-1 flex items-center justify-end gap-1 ${message.audioSrc ? "pr-10" : ""}`}>
                  <span className="text-[10px] opacity-60">
                    {new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {message.isUser && (
                    <svg className="h-3 w-3 opacity-60" viewBox="0 0 16 11" fill="currentColor">
                      <path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.405-2.272a.463.463 0 0 0-.336-.146.47.47 0 0 0-.343.146l-.311.31a.445.445 0 0 0-.14.337c0 .136.047.25.14.343l2.996 2.996a.724.724 0 0 0 .502.203.697.697 0 0 0 .546-.266l6.646-8.417a.497.497 0 0 0 .108-.299.441.441 0 0 0-.19-.374l-.338-.273z" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1 rounded-lg bg-card px-4 py-3">
                <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "0ms" }} />
                <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "150ms" }} />
                <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          {/* Options */}
          {allMessagesShown && options && !selectedOption && (
            <div className="mt-4 flex flex-col gap-2">
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(option.id, option.label)}
                  className="w-full rounded-lg border border-primary/30 bg-card px-4 py-3 text-left text-sm text-foreground transition-colors hover:border-primary hover:bg-primary/10"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-border bg-card p-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={enableInput ? "Escribe un mensaje..." : ""}
            disabled={!enableInput || !allMessagesShown}
            className="flex-1 rounded-full bg-secondary px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!enableInput || !inputValue.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}
