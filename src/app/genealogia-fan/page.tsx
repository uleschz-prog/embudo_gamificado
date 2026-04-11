import type { Metadata } from "next";
import Link from "next/link";
import FanChartDemo from "./fan-chart-demo";

export const metadata: Metadata = {
  title: "Cuadro en abanico · Raizoma",
  description: "Vista genealógica de descendencia en abanico (demo)",
};

export default function GenealogiaFanPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-neutral-950 text-white">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
        <div>
          <h1 className="text-base font-bold tracking-tight sm:text-lg">
            Cuadro en abanico
          </h1>
          <p className="text-xs text-white/50 sm:text-sm">
            Descendencia · raíz arriba al centro · datos de prueba
          </p>
        </div>
        <Link
          href="/"
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-white/90 transition hover:bg-white/10 sm:text-sm"
        >
          Volver al inicio
        </Link>
      </header>
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 p-4 sm:p-6">
        <FanChartDemo />
      </div>
    </div>
  );
}
