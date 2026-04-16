export function rawToDisplay(raw: number): number {
  return raw - 5;
}

export function displayToRaw(display: number): number {
  return display + 5;
}

export function formatDisplay(raw: number | null): string {
  if (raw === null || raw === undefined) return '—';
  const d = raw - 5;
  if (d === 0) return '0';
  return d > 0 ? `+${d.toFixed(1)}` : d.toFixed(1);
}

export function formatDisplayInt(raw: number): string {
  const d = Math.round(raw - 5);
  if (d === 0) return '0';
  return d > 0 ? `+${d}` : `${d}`;
}

export const DISPLAY_MIN = -4;
export const DISPLAY_MAX = 4;
export const DISPLAY_NEUTRAL = 0;
export const RAW_NEUTRAL = 5;

export const COLOR_PROGRESSIVE = '#dc2626';
export const COLOR_NEUTRAL = '#22c55e';
export const COLOR_TRADITIONAL = '#2563eb';

export const SHEX: string[] = [
  '#dc2626', '#ef4444', '#f87171', '#fca5a5', '#86efac',
  '#22c55e', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb',
];

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function lerpColor(from: string, to: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(from);
  const [r2, g2, b2] = hexToRgb(to);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${b})`;
}

export function displayBarColor(displayVal: number): string {
  if (displayVal === 0) return '#86efac';
  const t = Math.min(Math.abs(displayVal) / 4, 1);
  const minT = 0.55;
  const adjT = minT + t * (1 - minT);
  if (displayVal < 0) return lerpColor('#fca5a5', COLOR_PROGRESSIVE, adjT);
  return lerpColor('#93c5fd', COLOR_TRADITIONAL, adjT);
}

export function displayBarBorder(displayVal: number): string {
  if (displayVal === 0) return '#4ade80';
  const t = Math.min(Math.abs(displayVal) / 4, 1);
  const minT = 0.55;
  const adjT = minT + t * (1 - minT);
  if (displayVal < 0) return lerpColor('#f87171', '#dc2626', adjT);
  return lerpColor('#60a5fa', '#2563eb', adjT);
}

export const BELIEF_GRADIENT_CSS = `linear-gradient(90deg, #dc2626, #fca5a5 25%, #22c55e 50%, #93c5fd 75%, #2563eb)`;
