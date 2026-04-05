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

export function beliefLabel(v: number): string {
  if (v <= 10)  return 'False to me';
  if (v <= 30)  return 'Unlikely true';
  if (v <= 45)  return 'Leaning false';
  if (v <= 55)  return 'Uncertain';
  if (v <= 70)  return 'Leaning true';
  if (v <= 88)  return 'Likely true';
  return 'Deeply true to me';
}

export function beliefColor(v: number): string {
  if (v <= 10)  return '#35E4CF';
  if (v <= 30)  return '#5EECD8';
  if (v <= 45)  return '#a0f2e7';
  if (v <= 55)  return '#ffffff';
  if (v <= 70)  return '#a8d4ff';
  if (v <= 88)  return '#6FB8FF';
  return '#52A8FF';
}

export function catColour(v: number | null): string {
  if (v == null) return '#ffffff';
  if (v <= 0.22) return '#35E4CF';
  if (v <= 0.40) return '#5EECD8';
  if (v <= 0.60) return '#ffffff';
  if (v <= 0.78) return '#6FB8FF';
  return '#52A8FF';
}
