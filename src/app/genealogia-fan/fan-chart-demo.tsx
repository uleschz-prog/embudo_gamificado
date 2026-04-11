"use client";

import FanChartGenealogy from "@/components/FanChartGenealogy";
import sampleTree from "@/data/fan-chart-sample.json";
import type { FanChartPerson } from "@/types/fan-chart";

const tree = sampleTree as FanChartPerson;

export default function FanChartDemo() {
  return (
    <div className="flex flex-1 flex-col gap-3">
      <FanChartGenealogy
        data={tree}
        onVerRed={(p) => {
          console.log("Callback onVerRed:", p.id, p.fullName);
        }}
      />
      <p className="text-center text-[11px] text-white/40">
        JSON de ejemplo:{" "}
        <code className="rounded bg-white/5 px-1 text-white/60">src/data/fan-chart-sample.json</code>
      </p>
    </div>
  );
}
