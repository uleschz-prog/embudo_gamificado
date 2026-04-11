"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const WHATSAPP_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_URL ??
  "https://chat.whatsapp.com/INVITE_DE_TU_GRUPO";

const LS_KEY = "raizoma_funnel_videos_v2";

/** Fuentes por defecto si no hay videos en servidor */
const DEFAULT_VIDEOS = [
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
] as const;

const FUNNEL_META = [
  { id: "f1", user: "@raizoma", caption: "Paso 1 · Origen. Desliza arriba." },
  { id: "f2", user: "@raizoma", caption: "Paso 2 · Energía y propósito." },
  {
    id: "f3",
    user: "@raizoma",
    caption: "Paso 3 · Tu siguiente nivel. Gamificación activa.",
  },
] as const;

const SLIDE_COUNT = FUNNEL_META.length;

type UploadSlot = string | null;

function parseStoredUploads(raw: string | null): UploadSlot[] | null {
  if (!raw) return null;
  try {
    const a = JSON.parse(raw) as unknown;
    if (!Array.isArray(a) || a.length !== 3) return null;
    const slots = a.map((x) =>
      typeof x === "string" &&
      (x.startsWith("/uploads/") || x.startsWith("blob:"))
        ? x
        : null,
    ) as UploadSlot[];
    return slots;
  } catch {
    return null;
  }
}

export default function App() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const uploadsRef = useRef<UploadSlot[]>([null, null, null]);

  const [uploads, setUploads] = useState<UploadSlot[]>([null, null, null]);
  const [hydrated, setHydrated] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [videoBroken, setVideoBroken] = useState<Record<number, boolean>>({});
  const [slotBusy, setSlotBusy] = useState<Record<number, boolean>>({});
  const [slotError, setSlotError] = useState<Record<number, string | null>>({});

  uploadsRef.current = uploads;

  useEffect(() => {
    const stored = parseStoredUploads(localStorage.getItem(LS_KEY));
    if (stored) setUploads(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(uploads));
    } catch {
      /* quota / privado */
    }
  }, [uploads, hydrated]);

  useEffect(() => {
    return () => {
      uploadsRef.current.forEach((u) => {
        if (u?.startsWith("blob:")) URL.revokeObjectURL(u);
      });
    };
  }, []);

  const videoSrc = useMemo(
    () =>
      [0, 1, 2].map((i) => uploads[i] ?? DEFAULT_VIDEOS[i]) as [
        string,
        string,
        string,
      ],
    [uploads],
  );

  useEffect(() => {
    setVideoBroken({});
  }, [uploads]);

  const setSlideRef = useCallback((el: HTMLElement | null, index: number) => {
    slideRefs.current[index] = el;
  }, []);

  const setVideoRef = useCallback((el: HTMLVideoElement | null, index: number) => {
    videoRefs.current[index] = el;
  }, []);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;

    let ticking = false;
    const updateActive = () => {
      ticking = false;
      const h = root.clientHeight || 1;
      let best = 0;
      let bestScore = 0;
      slideRefs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const rr = root.getBoundingClientRect();
        const visible =
          Math.min(r.bottom, rr.bottom) - Math.max(r.top, rr.top);
        const score = Math.max(0, visible) / h;
        if (score > bestScore) {
          bestScore = score;
          best = i;
        }
      });
      if (bestScore > 0.22) setActive(best);
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateActive);
      }
    };

    root.addEventListener("scroll", onScroll, { passive: true });
    updateActive();
    return () => root.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === active) {
        void v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, [active, videoSrc]);

  const toggleLike = useCallback((id: string) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const uploadFile = useCallback(async (index: number, file: File) => {
    setSlotError((e) => ({ ...e, [index]: null }));
    setSlotBusy((b) => ({ ...b, [index]: true }));
    try {
      const body = new FormData();
      body.append("file", file);

      const res = await fetch("/api/funnel-upload", {
        method: "POST",
        body,
      });

      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };

      if (!res.ok) {
        throw new Error(data.error || `Error ${res.status}`);
      }
      if (!data.url?.startsWith("/uploads/")) {
        throw new Error("Respuesta inválida del servidor");
      }

      setUploads((prev) => {
        const next = [...prev] as UploadSlot[];
        const old = next[index];
        if (old?.startsWith("blob:")) URL.revokeObjectURL(old);
        next[index] = data.url!;
        return next as [UploadSlot, UploadSlot, UploadSlot];
      });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "No se pudo subir el video";
      setSlotError((e) => ({ ...e, [index]: msg }));
    } finally {
      setSlotBusy((b) => ({ ...b, [index]: false }));
    }
  }, []);

  const restoreDefaults = useCallback(() => {
    setUploads((prev) => {
      prev.forEach((u) => {
        if (u?.startsWith("blob:")) URL.revokeObjectURL(u);
      });
      return [null, null, null];
    });
    setSlotError({});
    try {
      localStorage.removeItem(LS_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const touchStartY = useRef(0);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0]?.clientY ?? 0;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const endY = e.changedTouches[0]?.clientY ?? touchStartY.current;
      const dy = touchStartY.current - endY;

      if (dy > 48) {
        const next = Math.min(active + 1, SLIDE_COUNT - 1);
        slideRefs.current[next]?.scrollIntoView({ behavior: "auto", block: "start" });
      } else if (dy < -48) {
        const prev = Math.max(active - 1, 0);
        slideRefs.current[prev]?.scrollIntoView({ behavior: "auto", block: "start" });
      }
    },
    [active],
  );

  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-neutral-950 text-white">
      <button
        type="button"
        onClick={() => setPanelOpen(true)}
        className="absolute left-3 top-[max(0.75rem,env(safe-area-inset-top))] z-40 rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-300 backdrop-blur-md transition hover:border-emerald-400/50 hover:bg-black/70"
      >
        Subir 3 videos
      </button>

      {panelOpen && (
        <div
          className="absolute inset-0 z-50 flex items-end justify-center bg-black/75 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="funnel-upload-title"
          onClick={() => setPanelOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-5 shadow-2xl shadow-violet-900/20"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="funnel-upload-title"
              className="text-lg font-bold text-white"
            >
              Videos del funnel (3 pasos)
            </h2>
            <p className="mt-1 text-sm text-white/60">
              Los archivos se guardan en el servidor (carpeta{" "}
              <code className="rounded bg-black/40 px-1 text-emerald-200/90">
                public/uploads/funnel
              </code>
              ) y se sirven como URL pública. Máximo ~150 MB por archivo.
            </p>

            <div className="mt-5 space-y-4">
              {[0, 1, 2].map((i) => (
                <label
                  key={i}
                  className="flex flex-col gap-1 rounded-xl border border-white/10 bg-black/40 p-3"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-emerald-400/90">
                    Video {i + 1}
                    {i === 2 ? " · gamificación" : ""}
                  </span>
                  <input
                    type="file"
                    accept="video/*"
                    disabled={!!slotBusy[i]}
                    className="text-xs text-white/80 file:mr-2 file:rounded-lg file:border-0 file:bg-violet-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-violet-500 disabled:opacity-40"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      e.target.value = "";
                      if (f) await uploadFile(i, f);
                    }}
                  />
                  <span className="text-[11px] text-white/50">
                    {slotBusy[i] ? (
                      <span className="text-amber-300">Subiendo al servidor…</span>
                    ) : slotError[i] ? (
                      <span className="text-red-400">{slotError[i]}</span>
                    ) : uploads[i]?.startsWith("/uploads/") ? (
                      <span className="truncate text-emerald-400/90">
                        Guardado: {uploads[i]}
                      </span>
                    ) : uploads[i]?.startsWith("blob:") ? (
                      <span className="text-white/40">Vista previa local (sube de nuevo para guardar en servidor)</span>
                    ) : (
                      <span className="text-white/40">Demo por defecto</span>
                    )}
                  </span>
                </label>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={restoreDefaults}
                className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/5"
              >
                Restaurar demos
              </button>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-violet-600 px-4 py-2.5 text-sm font-bold text-neutral-950 transition hover:opacity-95"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        ref={scrollerRef}
        className="tiktok-scroller min-h-0 w-full flex-1 snap-y snap-mandatory overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {FUNNEL_META.map((item, index) => (
          <section
            key={`${item.id}-${videoSrc[index]}`}
            ref={(el) => setSlideRef(el, index)}
            data-slide={index}
            className="relative h-[100dvh] min-h-[100svh] w-full shrink-0 snap-start [scroll-snap-stop:always]"
          >
            <div
              className="absolute inset-0 bg-gradient-to-br from-emerald-950/40 via-neutral-950 to-violet-950/50"
              aria-hidden
            />
            <video
              key={videoSrc[index]}
              ref={(el) => setVideoRef(el, index)}
              className={`absolute inset-0 h-full w-full object-cover ${
                videoBroken[index] ? "opacity-0" : "opacity-90"
              }`}
              src={videoSrc[index]}
              muted
              loop
              playsInline
              preload="auto"
              onError={() =>
                setVideoBroken((prev) => ({ ...prev, [index]: true }))
              }
            />
            {videoBroken[index] ? (
              <div className="absolute inset-0 z-[1] flex items-center justify-center bg-neutral-900/90 px-6 text-center text-sm text-white/80">
                No se pudo cargar el video. Sube un archivo compatible (p. ej.
                .mp4) o revisa que el servidor esté en marcha.
              </div>
            ) : null}
            <div className="absolute inset-0 z-[2] bg-gradient-to-b from-black/70 via-transparent to-black/80" />

            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col gap-2 px-4 pt-[max(2.75rem,env(safe-area-inset-top))]">
              <div className="flex gap-1">
                {FUNNEL_META.map((m, i) => (
                  <div
                    key={m.id}
                    className={`h-1 flex-1 rounded-full transition-colors duration-150 ${
                      i === active ? "bg-emerald-400" : "bg-white/20"
                    }`}
                  />
                ))}
              </div>
              <p className="text-center text-[10px] font-medium uppercase tracking-[0.2em] text-white/50">
                Raizoma · funnel 3 pasos
              </p>
            </div>

            <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-end pb-[max(1.25rem,env(safe-area-inset-bottom))] pl-4 pr-3">
              <div className="pointer-events-auto max-w-[72%] space-y-2">
                <p className="text-sm font-semibold text-emerald-300/90">
                  {item.user}
                </p>
                <p className="text-sm leading-snug text-white/90 drop-shadow-md">
                  {item.caption}
                </p>
              </div>
            </div>

            <div className="pointer-events-none absolute bottom-[max(5.5rem,env(safe-area-inset-bottom))] right-3 z-20 flex flex-col items-center gap-5">
              <button
                type="button"
                aria-label="Me gusta"
                onClick={() => toggleLike(item.id)}
                className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-black/45 backdrop-blur-md transition active:scale-90"
              >
                <span
                  className={`text-2xl transition-transform ${
                    liked[item.id] ? "scale-110 text-fuchsia-400" : "text-white"
                  }`}
                >
                  {liked[item.id] ? "♥" : "♡"}
                </span>
              </button>
            </div>

            {index === 2 ? (
              <div className="pointer-events-none absolute inset-x-4 bottom-[max(7rem,env(safe-area-inset-bottom))] z-30 flex justify-center">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pointer-events-auto w-full max-w-md rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-violet-600 px-5 py-4 text-center text-base font-black uppercase tracking-wide text-neutral-950 shadow-[0_0_40px_rgba(52,211,153,0.55),0_0_60px_rgba(167,139,250,0.35)] transition active:scale-[0.98] sm:text-lg"
                >
                  UNIRSE AL EQUIPO DE WHATSAPP
                </a>
              </div>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  );
}
