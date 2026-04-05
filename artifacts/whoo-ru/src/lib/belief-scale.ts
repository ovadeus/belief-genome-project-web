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
