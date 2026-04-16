export const CAT_ORDER = ['philosophy', 'religion', 'psychology', 'relationships', 'society', 'economics', 'science_tech', 'politics', 'life'];

export const CAT_SHORT: Record<string, string> = {
  philosophy: 'Philosophy', religion: 'Religion', psychology: 'Psychology',
  relationships: 'Relationships', society: 'Society', economics: 'Economics',
  science_tech: 'Sci & Tech', politics: 'Politics', life: 'Life',
};

export const DOMAIN_AXES: Record<string, { left: string; right: string; mid: string }> = {
  philosophy:    { left: 'Relativist',   right: 'Absolutist',      mid: 'Mixed epistemic'  },
  religion:      { left: 'Secular',      right: 'Spiritual',       mid: 'Open spiritual'   },
  psychology:    { left: 'Determinist',  right: 'Autonomous',      mid: 'Compatibilist'    },
  relationships: { left: 'Fluid',        right: 'Traditional',     mid: 'Contextual'       },
  society:       { left: 'Collectivist', right: 'Individualist',   mid: 'Balanced social'  },
  economics:     { left: 'Progressive',  right: 'Market-oriented', mid: 'Mixed economic'   },
  science_tech:  { left: 'Tech-skeptic', right: 'Techno-optimist', mid: 'Tech-pragmatist'  },
  politics:      { left: 'Progressive',  right: 'Conservative',    mid: 'Centrist'         },
  life:          { left: 'Structured',   right: 'Spontaneous',     mid: 'Balanced'         },
};

export function domainLabel(cat: string, avg: number): string {
  const axis = DOMAIN_AXES[cat];
  if (!axis || avg == null) return '—';
  if (avg <= 0.22) return `Strongly ${axis.left}`;
  if (avg <= 0.40) return axis.left;
  if (avg <= 0.60) return axis.mid;
  if (avg <= 0.78) return axis.right;
  return `Strongly ${axis.right}`;
}

export const SHEX: string[] = [
  '#dc2626', '#ef4444', '#f87171', '#fca5a5', '#86efac',
  '#22c55e', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb',
];

export const BELIEF_LABELS_10 = [
  'Absolute False', 'Deeply False', 'False', 'Leaning False', 'Near Neutral',
  'Uncertain', 'Leaning True', 'True', 'Deeply True', 'Absolute True',
];

export const BELIEF_GRADIENT = 'linear-gradient(90deg, #dc2626, #fca5a5 25%, #22c55e 50%, #93c5fd 75%, #2563eb)';

export function beliefLabel(v: number): string {
  if (v <= 5)   return 'Absolute False';
  if (v <= 15)  return 'Deeply False';
  if (v <= 28)  return 'False';
  if (v <= 42)  return 'Leaning False';
  if (v <= 52)  return 'Near Neutral';
  if (v <= 58)  return 'Uncertain';
  if (v <= 72)  return 'Leaning True';
  if (v <= 85)  return 'True';
  if (v <= 95)  return 'Deeply True';
  return 'Absolute True';
}

export function beliefColor(v: number): string {
  if (v <= 5)   return '#dc2626';
  if (v <= 15)  return '#ef4444';
  if (v <= 28)  return '#f87171';
  if (v <= 42)  return '#fca5a5';
  if (v <= 52)  return '#86efac';
  if (v <= 58)  return '#22c55e';
  if (v <= 72)  return '#93c5fd';
  if (v <= 85)  return '#60a5fa';
  if (v <= 95)  return '#3b82f6';
  return '#2563eb';
}

export function catColour(v: number | null): string {
  if (v == null) return '#86efac';
  if (v <= 0.11) return '#dc2626';
  if (v <= 0.22) return '#ef4444';
  if (v <= 0.33) return '#f87171';
  if (v <= 0.44) return '#fca5a5';
  if (v <= 0.55) return '#86efac';
  if (v <= 0.66) return '#93c5fd';
  if (v <= 0.77) return '#60a5fa';
  if (v <= 0.88) return '#3b82f6';
  return '#2563eb';
}
