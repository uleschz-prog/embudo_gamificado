"use client";

import { useCallback, useMemo, useState } from "react";
import {
  annulusSectorPath,
  buildFanLayout,
  polarToCartesian,
  ringRadii,
} from "@/lib/fan-chart-layout";
import type { FanChartPerson } from "@/types/fan-chart";

const PASTEL_FILLS = [
  "#c4daf5",
  "#fff3b0",
  "#e8d4f5",
  "#c8e6c9",
  "#ffd4c4",
  "#d4e8ff",
] as const;

const PASTEL_STROKES = [
  "#7eb8e8",
  "#e6c94a",
  "#b894d4",
  "#7ebf87",
  "#e89a7a",
  "#7aa8e0",
] as const;

function colorForNode(depth: number, branchIndex: number): { fill: string; stroke: string } {
  const i = (depth * 3 + branchIndex) % PASTEL_FILLS.length;
  return {
    fill: PASTEL_FILLS[i]!,
    stroke: PASTEL_STROKES[i]!,
  };
}

function truncateName(name: string, max: number): string {
  if (name.length <= max) return name;
  return `${name.slice(0, max - 1)}…`;
}

export type FanChartGenealogyProps = {
  data: FanChartPerson;
  /** Vista SVG interna (ancho × alto lógicos). */
  viewWidth?: number;
  viewHeight?: number;
  /** Radio del primer anillo (desde el pivote). */
  baseInner?: number;
  ringWidth?: number;
  onVerRed?: (person: FanChartPerson) => void;
};

export default function FanChartGenealogy({
  data,
  viewWidth = 720,
  viewHeight = 520,
  baseInner = 72,
  ringWidth = 88,
  onVerRed,
}: FanChartGenealogyProps) {
  const pivotX = viewWidth / 2;
  const pivotY = 28;
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [modalPerson, setModalPerson] = useState<FanChartPerson | null>(null);

  const layout = useMemo(() => buildFanLayout(data), [data]);

  const maxDepth = useMemo(
    () => layout.reduce((m, n) => Math.max(m, n.depth), 0),
    [layout],
  );

  const fitsScale = useMemo(() => {
    const neededR = baseInner + (maxDepth + 1) * ringWidth + 24;
    const scaleY = (viewHeight - 40) / neededR;
    const scaleX = (viewWidth - 32) / (neededR * Math.sin((78 * Math.PI) / 180) * 2 + 40);
    return Math.min(1, scaleX, scaleY);
  }, [baseInner, maxDepth, ringWidth, viewHeight, viewWidth]);

  const handleFit = useCallback(() => {
    setZoom(fitsScale);
    setPan({ x: 0, y: 0 });
  }, [fitsScale]);

  const handleHome = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setFocusId(null);
    setFilterText("");
  }, []);

  const handleVerRed = useCallback(
    (person: FanChartPerson) => {
      const msg = `Abriendo red para ${person.fullName}`;
      console.log(msg);
      onVerRed?.(person);
      setModalPerson(person);
    },
    [onVerRed],
  );

  const matchesFilter = useCallback(
    (name: string) => {
      const q = filterText.trim().toLowerCase();
      if (!q) return true;
      return name.toLowerCase().includes(q);
    },
    [filterText],
  );

  return (
    <div className="relative h-full min-h-[420px] w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black text-zinc-900 shadow-inner">
      {/* Panel de controles — esquina superior derecha */}
      <div className="absolute right-2 top-2 z-30 flex flex-wrap items-center justify-end gap-1.5 sm:right-3 sm:top-3">
        <div className="relative">
          <select
            aria-label="Tipo de vista"
            className="cursor-pointer rounded-lg border border-white/20 bg-black/60 py-1.5 pl-2 pr-7 text-[10px] font-bold uppercase tracking-wide text-white/90 backdrop-blur-sm sm:text-[11px]"
            defaultValue="abanico"
          >
            <option value="abanico">Cuadro en abanico</option>
          </select>
        </div>
        <button
          type="button"
          title="Filtros"
          aria-label="Filtros"
          onClick={() => setFilterOpen((v) => !v)}
          className={`flex h-8 w-8 items-center justify-center rounded-lg border text-sm transition ${
            filterOpen || filterText
              ? "border-violet-400/60 bg-violet-500/25 text-white"
              : "border-white/20 bg-black/55 text-white/85 hover:bg-black/70"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M4 6h16M7 12h10M10 18h4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <button
          type="button"
          title="Inicio — restablecer vista"
          aria-label="Inicio"
          onClick={handleHome}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-black/55 text-white/85 transition hover:bg-black/70"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          title="Ajustar a pantalla"
          aria-label="Ajustar pantalla"
          onClick={handleFit}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-black/55 text-white/85 transition hover:bg-black/70"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M9 3H4v5M15 3h5v5M9 21H4v-5M15 21h5v-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <button
          type="button"
          title="Acercar"
          aria-label="Acercar"
          onClick={() => setZoom((z) => Math.min(2.5, z * 1.15))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-black/55 text-lg font-semibold leading-none text-white/90 transition hover:bg-black/70"
        >
          +
        </button>
        <button
          type="button"
          title="Alejar"
          aria-label="Alejar"
          onClick={() => setZoom((z) => Math.max(0.35, z / 1.15))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-black/55 text-lg font-semibold leading-none text-white/90 transition hover:bg-black/70"
        >
          −
        </button>
      </div>

      {filterOpen ? (
        <div className="absolute right-2 top-14 z-30 w-[min(280px,calc(100%-1rem))] rounded-xl border border-white/15 bg-black/80 p-3 shadow-xl backdrop-blur-md sm:right-3 sm:top-16">
          <label className="block text-[11px] font-medium uppercase tracking-wide text-white/50">
            Filtrar por nombre
          </label>
          <input
            type="search"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Ej. Pérez, María…"
            className="mt-1.5 w-full rounded-lg border border-white/15 bg-zinc-900/90 px-2.5 py-2 text-sm text-white placeholder:text-white/35"
          />
        </div>
      ) : null}

      <svg
        className="h-full w-full touch-none select-none"
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        role="img"
        aria-label="Cuadro genealógico en abanico de descendencia"
      >
        <defs>
          <filter id="fan-soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodOpacity="0.12" />
          </filter>
        </defs>
        <g
          transform={`translate(${viewWidth / 2 + pan.x} ${viewHeight * 0.52 + pan.y}) scale(${zoom}) translate(${-viewWidth / 2} ${-viewHeight * 0.52})`}
        >
          {layout.map((node) => {
            const { person, depth, angleStart, angleEnd, branchIndex } = node;
            const { rInner, rOuter } = ringRadii(depth, baseInner, ringWidth);
            const d = annulusSectorPath(pivotX, pivotY, rInner, rOuter, angleStart, angleEnd);
            const mid = (angleStart + angleEnd) / 2;
            const labelR = (rInner + rOuter) / 2;
            const c = polarToCartesian(pivotX, pivotY, labelR, mid);
            const colors = colorForNode(depth, branchIndex);
            const dimmed = !matchesFilter(person.fullName);
            const isHover = hoverId === person.id;
            const isFocus = focusId === person.id;
            const wedgeOpacity = dimmed ? 0.22 : 1;

            return (
              <g key={person.id}>
                <path
                  d={d}
                  fill={colors.fill}
                  stroke={isFocus ? "#1e3a5f" : colors.stroke}
                  strokeWidth={isFocus ? 2.2 : 1}
                  opacity={wedgeOpacity}
                  fillOpacity={isHover && !dimmed ? 0.88 : 1}
                  filter="url(#fan-soft-shadow)"
                  className="cursor-pointer transition-[fill-opacity,opacity] duration-150"
                  onMouseEnter={() => setHoverId(person.id)}
                  onMouseLeave={() => setHoverId((id) => (id === person.id ? null : id))}
                  onClick={() => setFocusId(person.id)}
                />
                <g
                  opacity={dimmed ? 0.35 : 1}
                  pointerEvents="bounding-box"
                  onClick={() => setFocusId(person.id)}
                  className="cursor-pointer"
                >
                  <text
                    x={c.x}
                    y={c.y - 10}
                    textAnchor="middle"
                    className="pointer-events-none fill-zinc-900 text-[11px] font-semibold sm:text-[12px]"
                    style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
                  >
                    {truncateName(person.fullName, 18)}
                  </text>
                  <text
                    x={c.x}
                    y={c.y + 6}
                    textAnchor="middle"
                    className="pointer-events-none fill-zinc-700 text-[9px] sm:text-[10px]"
                    style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
                  >
                    {person.lifeLabel}
                  </text>
                  <text
                    x={c.x}
                    y={c.y + 24}
                    textAnchor="middle"
                    className="pointer-events-auto fill-sky-800 text-[9px] underline decoration-sky-700/60 underline-offset-2 sm:text-[10px]"
                    style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVerRed(person);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        handleVerRed(person);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    Ver red
                  </text>
                </g>
              </g>
            );
          })}
        </g>
      </svg>

      {modalPerson ? (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="fan-modal-title"
          onClick={() => setModalPerson(null)}
        >
          <div
            className="max-w-sm rounded-2xl border border-white/15 bg-zinc-900 p-5 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="fan-modal-title" className="text-lg font-bold text-emerald-300">
              Red individual
            </h2>
            <p className="mt-2 text-sm text-white/80">
              Vista de red para{" "}
              <span className="font-semibold text-white">{modalPerson.fullName}</span> (
              {modalPerson.lifeLabel}).
            </p>
            <p className="mt-2 text-xs text-white/50">
              Aquí enlazarías tu ruta o modal real de red MLM/genealogía.
            </p>
            <button
              type="button"
              className="mt-5 w-full rounded-xl bg-white/10 py-2.5 text-sm font-medium text-white transition hover:bg-white/15"
              onClick={() => setModalPerson(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
