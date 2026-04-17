"use client"

import { useState, useEffect, useRef } from "react"
import { Check, ChevronDown, Shield, Zap, Target, Users, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WHATSAPP_GROUP_INVITE_URL } from "@/lib/whatsapp-invite"

export function SalesPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const sectionsRef = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in", "fade-in", "slide-in-from-bottom-4")
            entry.target.classList.remove("opacity-0")
          }
        })
      },
      { threshold: 0.1 }
    )

    sectionsRef.current.forEach((section) => {
      if (section) {
        section.classList.add("opacity-0")
        observer.observe(section)
      }
    })

    return () => observer.disconnect()
  }, [])

  const features = [
    { icon: Zap, title: "Energía Real", description: "Optimización biológica sin dependencias artificiales" },
    { icon: Target, title: "Control Total", description: "Ingresos que no dependen de terceros" },
    { icon: Shield, title: "Sistema Blindado", description: "Protección contra la manipulación del Granjero" },
    { icon: Users, title: "Red Soberana", description: "Comunidad de operadores, no de seguidores" },
  ]

  const faqs = [
    {
      question: "¿Esto es para mí?",
      answer: "Si sientes que produces pero con desgaste creciente, si sabes que podrías más pero estás bloqueado, o si dependes de ingresos que no controlas... sí, es para ti.",
    },
    {
      question: "¿Cuánto tiempo toma ver resultados?",
      answer: "El sistema está diseñado para cambios progresivos. La mayoría reporta mejoras en energía en las primeras 2 semanas, y cambios estructurales en 90 días.",
    },
    {
      question: "¿Es un MLM o esquema de afiliados?",
      answer: "No. Raizoma no es reclutamiento. Es un sistema de posicionamiento donde operas, no dependes.",
    },
    {
      question: "¿Qué incluye exactamente?",
      answer: "Productos de optimización biológica + Plan Soberano 50 + acceso a la red de operadores.",
    },
  ]

  return (
    <div className="min-h-dvh w-full bg-background">
      {/* Hero */}
      <section
        ref={(el) => { sectionsRef.current[0] = el }}
        className="flex min-h-dvh flex-col items-center justify-center px-6 py-20 text-center duration-700"
      >
        <div className="max-w-2xl">
          <span className="mb-4 inline-block rounded-full border border-primary/30 px-4 py-1 text-xs font-medium uppercase tracking-wider text-primary">
            Sistema Raizoma
          </span>
          <h1 className="mb-6 text-balance text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-5xl">
            No estás cansado…
            <br />
            <span className="text-primary">Estás siendo operado</span>
          </h1>
          <p className="mb-8 text-pretty text-lg text-muted-foreground">
            por un sistema que necesita que lo estés.
          </p>
          <Button size="lg" className="gap-2" asChild>
            <a
              href={WHATSAPP_GROUP_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Accede ahora
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </section>

      {/* Problem */}
      <section
        ref={(el) => { sectionsRef.current[1] = el }}
        className="border-t border-border px-6 py-20 duration-700"
      >
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-8 text-2xl font-bold text-foreground">El Problema</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>Te dijeron que el cansancio era normal.</p>
            <p>Que el café era necesario.</p>
            <p>Que depender de un salario era &quot;estabilidad&quot;.</p>
            <p className="pt-4 font-semibold text-foreground">
              Pero nada de eso es accidental. Es diseño.
            </p>
          </div>
        </div>
      </section>

      {/* Villain */}
      <section
        ref={(el) => { sectionsRef.current[2] = el }}
        className="border-t border-border bg-card px-6 py-20 duration-700"
      >
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-8 text-2xl font-bold text-foreground">El Sistema del Granjero</h2>
          <ul className="space-y-3">
            {[
              "Te mantiene funcional, no óptimo",
              "Crea dependencia de sustancias y sistemas",
              "Controla tu energía para controlar tu producción",
              "Te hace creer que no hay alternativa",
            ].map((item, index) => (
              <li key={index} className="flex items-start gap-3 text-muted-foreground">
                <div className="mt-1.5 h-2 w-2 rounded-full bg-destructive" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Solution */}
      <section
        ref={(el) => { sectionsRef.current[3] = el }}
        className="border-t border-border px-6 py-20 duration-700"
      >
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-4 text-2xl font-bold text-foreground">La Solución</h2>
          <p className="mb-8 text-lg text-primary">
            Raizoma no es un producto. Es un sistema que opera fuera de las reglas del Granjero.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            {features.map((feature, index) => (
              <div key={index} className="rounded-lg border border-border bg-card p-6">
                <feature.icon className="mb-4 h-8 w-8 text-primary" />
                <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Offer */}
      <section
        ref={(el) => { sectionsRef.current[4] = el }}
        className="border-t border-border bg-card px-6 py-20 duration-700"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-8 text-2xl font-bold text-foreground">Lo Que Incluye</h2>
          <div className="rounded-xl border border-primary/30 bg-background p-8">
            <div className="mb-6 space-y-4">
              {[
                "Sistema Raizoma completo",
                "Productos de optimización biológica",
                "Plan Soberano 50",
                "Acceso a la red de operadores",
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>
            <div className="mb-6 border-t border-border pt-6">
              <span className="text-sm text-muted-foreground">Solo</span>
              <p className="text-3xl font-bold text-primary">20 posiciones iniciales</p>
            </div>
            <Button size="lg" className="w-full gap-2" asChild>
              <a
                href={WHATSAPP_GROUP_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Accede Ahora
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        ref={(el) => { sectionsRef.current[5] = el }}
        className="border-t border-border px-6 py-20 duration-700"
      >
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground">
            Preguntas Frecuentes
          </h2>
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <div key={index} className="rounded-lg border border-border">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-center justify-between p-4 text-left"
                >
                  <span className="font-medium text-foreground">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="border-t border-border px-4 py-3">
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        ref={(el) => { sectionsRef.current[6] = el }}
        className="border-t border-border bg-card px-6 py-20 duration-700"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground">
            No puedes volver a &quot;no saber&quot; esto
          </h2>
          <p className="mb-8 text-muted-foreground">
            El siguiente paso es tuyo.
          </p>
          <Button size="lg" className="gap-2" asChild>
            <a
              href={WHATSAPP_GROUP_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Accede Ahora
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center text-sm text-muted-foreground">
        <p>Sistema Raizoma — Fuera del sistema del Granjero</p>
      </footer>
    </div>
  )
}
