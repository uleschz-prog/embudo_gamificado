"use client"

import { useState, useCallback } from "react"
import { IncomingCall } from "@/components/experiences/incoming-call"
import { HackerScanner } from "@/components/experiences/hacker-scanner"
import { WhatsAppChat } from "@/components/experiences/whatsapp-chat"
import { HackerPlayer } from "@/components/experiences/hacker-player"
import { TikTokFeed } from "@/components/experiences/tiktok-feed"
import { SalesPage } from "@/components/experiences/sales-page"

type ExperienceScreen =
  | "call"
  | "scanner"
  | "whatsapp-pattern"
  | "player"
  | "whatsapp-post-vsl"
  | "feed"
  | "sales"

// WhatsApp message sequences
const PATTERN_MESSAGES = [
  { id: 1, audioSrc: "/audio/whatsapp-message-1.wav", audioDuration: "0:15", delay: 2000, waitForAudioEnd: true },
  { id: 2, text: "Vamos a clasificarte...", delay: 1500 },
  { id: 3, text: "Esto define si puedes avanzar", delay: 1500 },
  { id: 4, text: "Elige lo que más se acerca a ti:", delay: 1500 },
]

const QUIZ_OPTIONS_INLINE = [
  { id: "A", label: "A) Produces... pero cada vez con más desgaste" },
  { id: "B", label: "B) Sabes que podrías más... pero estás bloqueado" },
  { id: "C", label: "C) Dependes de ingresos que no controlas" },
]

const POST_VSL_MESSAGES = [
  {
    id: 1,
    audioSrc: "/audio/whatsapp-post-vsl.wav",
    audioDuration: "0:20",
    delay: 1500,
    waitForAudioEnd: true,
  },
]

export function ExperienceController() {
  const [currentScreen, setCurrentScreen] = useState<ExperienceScreen>("call")

  const handleScreenComplete = useCallback((nextScreen: ExperienceScreen) => {
    setCurrentScreen(nextScreen)
  }, [])

  return (
    <main className="min-h-dvh w-full overflow-x-hidden">
      {currentScreen === "call" && (
        <IncomingCall onComplete={() => handleScreenComplete("scanner")} />
      )}

      {currentScreen === "scanner" && (
        <HackerScanner onComplete={() => handleScreenComplete("whatsapp-pattern")} />
      )}

      {currentScreen === "whatsapp-pattern" && (
        <WhatsAppChat
          contactName="Asesor Raiz"
          contactImage="/images/logo.png"
          messages={PATTERN_MESSAGES}
          onComplete={() => handleScreenComplete("player")}
          options={QUIZ_OPTIONS_INLINE}
          onOptionSelect={() => handleScreenComplete("player")}
        />
      )}

      {currentScreen === "player" && (
        <HackerPlayer onComplete={() => handleScreenComplete("whatsapp-post-vsl")} />
      )}

      {currentScreen === "whatsapp-post-vsl" && (
        <WhatsAppChat
          contactName="Asesor Raiz"
          contactImage="/images/logo.png"
          messages={POST_VSL_MESSAGES}
          onComplete={() => handleScreenComplete("feed")}
          enableInput
          inputTrigger="ACCESO"
        />
      )}

      {currentScreen === "feed" && (
        <TikTokFeed onComplete={() => handleScreenComplete("sales")} />
      )}

      {currentScreen === "sales" && <SalesPage />}
    </main>
  )
}
