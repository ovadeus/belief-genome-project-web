export const BELIEF_COLORS = [
  '#dc2626','#ef4444','#f87171','#fca5a5',
  '#22c55e','#93c5fd','#60a5fa','#3b82f6','#2563eb',
] as const;

export const BELIEF_LABELS = [
  'Absolute False','Deeply False','False','Leaning False',
  'Uncertain','Leaning True','True','Deeply True','Absolute True',
] as const;

export const BELIEF_THRESHOLDS = [11,22,33,44,55,66,77,88] as const;

export function beliefIndexFromValue(value: number): number {
  const v = Math.max(0, Math.min(100, value));
  for (let i = 0; i < BELIEF_THRESHOLDS.length; i++) {
    if (v <= BELIEF_THRESHOLDS[i]) return i;
  }
  return 8;
}

export function beliefLabelFromValue(value: number): string {
  return BELIEF_LABELS[beliefIndexFromValue(value)];
}

export function beliefColorFromValue(value: number): string {
  return BELIEF_COLORS[beliefIndexFromValue(value)];
}

export type DomainAxis = {
  key: string; short: string;
  left: string; right: string; mid: string;
};

export const DOMAIN_AXES: DomainAxis[] = [
  { key:'philosophy',    short:'Philosophy',    left:'Relativist',   right:'Absolutist',      mid:'Mixed epistemic' },
  { key:'religion',      short:'Religion',      left:'Secular',      right:'Spiritual',       mid:'Open spiritual'  },
  { key:'psychology',    short:'Psychology',    left:'Determinist',  right:'Autonomous',      mid:'Compatibilist'   },
  { key:'relationships', short:'Relationships', left:'Fluid',        right:'Traditional',     mid:'Contextual'      },
  { key:'society',       short:'Society',       left:'Collectivist', right:'Individualist',   mid:'Balanced social' },
  { key:'economics',     short:'Economics',     left:'Progressive',  right:'Market-oriented', mid:'Mixed economic'  },
  { key:'science_tech',  short:'Sci & Tech',    left:'Tech-skeptic', right:'Techno-optimist', mid:'Tech-pragmatist' },
  { key:'politics',      short:'Politics',      left:'Progressive',  right:'Conservative',    mid:'Centrist'        },
  { key:'life',          short:'Life',          left:'Structured',   right:'Spontaneous',     mid:'Balanced'        },
];

export const NUDGE_INTERVALS = [
  { value:'manual', label:"Manual — I'll open it myself" },
  { value:'5',      label:'Every 5 min' },
  { value:'15',     label:'Every 15 min' },
  { value:'30',     label:'Every 30 min' },
  { value:'60',     label:'Every hour' },
  { value:'360',    label:'Every 6 hours' },
  { value:'1440',   label:'Once a day' },
  { value:'10080',  label:'Once a week' },
] as const;
