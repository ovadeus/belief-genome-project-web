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

export function displayBarColor(displayVal: number): string {
  if (displayVal === 0) return '#787891';
  const t = Math.min(Math.abs(displayVal) / 4, 1);
  if (displayVal > 0) {
    const r = Math.round(120 - t * 72);
    const g = Math.round(143 + t * 17);
    const b = Math.round(145 + t * 110);
    return `rgb(${r},${g},${b})`;
  }
  const r = Math.round(120 + t * 100);
  const g = Math.round(143 - t * 93);
  const b = Math.round(145 - t * 95);
  return `rgb(${r},${g},${b})`;
}

export function displayBarBorder(displayVal: number): string {
  if (displayVal === 0) return '#9999aa';
  const t = Math.min(Math.abs(displayVal) / 4, 1);
  if (displayVal > 0) {
    const r = Math.round(80 - t * 32);
    const g = Math.round(120 + t * 40);
    const b = Math.round(180 + t * 75);
    return `rgb(${r},${g},${b})`;
  }
  const r = Math.round(180 + t * 40);
  const g = Math.round(80 - t * 30);
  const b = Math.round(80 - t * 30);
  return `rgb(${r},${g},${b})`;
}
