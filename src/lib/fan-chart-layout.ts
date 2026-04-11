import type { FanChartLayoutNode, FanChartPerson } from "@/types/fan-chart";

/** Abanico de descendencia: ángulos en radianes, 0 = hacia abajo, negativo = izquierda. */
const MAX_HALF_SPAN = (78 * Math.PI) / 180;

function collectLayout(
  person: FanChartPerson,
  angleStart: number,
  angleEnd: number,
  depth: number,
  branchIndex: number,
  out: FanChartLayoutNode[],
): void {
  out.push({
    person,
    depth,
    angleStart,
    angleEnd,
    branchIndex,
  });
  const kids = person.children ?? [];
  if (kids.length === 0) return;
  const span = angleEnd - angleStart;
  let t = angleStart;
  for (let i = 0; i < kids.length; i++) {
    const w = span / kids.length;
    collectLayout(kids[i]!, t, t + w, depth + 1, i, out);
    t += w;
  }
}

export function buildFanLayout(root: FanChartPerson): FanChartLayoutNode[] {
  const out: FanChartLayoutNode[] = [];
  collectLayout(root, -MAX_HALF_SPAN, MAX_HALF_SPAN, 0, 0, out);
  return out;
}

export function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleRad: number,
): { x: number; y: number } {
  return {
    x: cx + r * Math.sin(angleRad),
    y: cy + r * Math.cos(angleRad),
  };
}

/** Anillo anular en SVG (y hacia abajo). */
export function annulusSectorPath(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  a0: number,
  a1: number,
): string {
  const p1 = polarToCartesian(cx, cy, rOuter, a0);
  const p2 = polarToCartesian(cx, cy, rOuter, a1);
  const p3 = polarToCartesian(cx, cy, rInner, a1);
  const p4 = polarToCartesian(cx, cy, rInner, a0);
  const large = Math.abs(a1 - a0) > Math.PI ? 1 : 0;
  return [
    `M ${p1.x} ${p1.y}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${p4.x} ${p4.y}`,
    "Z",
  ].join(" ");
}

export function ringRadii(
  depth: number,
  baseInner: number,
  ringWidth: number,
): { rInner: number; rOuter: number } {
  const rInner = baseInner + depth * ringWidth;
  const rOuter = rInner + ringWidth;
  return { rInner, rOuter };
}
