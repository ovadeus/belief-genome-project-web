/**
 * Research-grounded seed data for the Explore visualizations.
 *
 * Archetypes derive from:
 *   - Pew Research Center (Global Attitudes 2023-24, Religion in India 2021,
 *     Generational politics in the U.S., Views on LGBTQ+ 2023)
 *   - World Values Survey Wave 7 / Inglehart-Welzel cultural map (2023 update)
 *   - Ipsos Global Advisor 2023 (abortion attitudes across 29 countries)
 *   - PRRI, Gallup, Eurobarometer 2024
 *
 * Each archetype has a per-category mean (0-9 scale) plus explicit dimension
 * overrides for the most well-studied "signature" beliefs.
 *
 * All rows are inserted with is_test_data = true so cleanup-test-data.ts can
 * remove them cleanly once real user volume crosses critical mass.
 */

import { db } from '@workspace/db';
import { genomeSubmissions } from '@workspace/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

type Category =
  | 'epistemology' | 'spirituality' | 'morality' | 'politics' | 'social'
  | 'economics' | 'science_tech' | 'education' | 'health' | 'psychology' | 'relationships';

const CATEGORY_DIMS: Record<Category, number[]> = {
  epistemology:  [4,5,6,7,8,9,10,11,12,13],
  spirituality:  [14,15,16,17,18,19,20,21,22,23,24,25,26,27,28],
  morality:      [29,30,31,32,33,34,35,36,37,38,39,40,41,42,43],
  politics:      [44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63],
  social:        [64,65,66,67,68,69,70,71,72,73,74,75,76,77,78],
  economics:     [79,80,81,82,83,84,85,86,87,88],
  science_tech:  [89,90,91,92,93,94,95,96,97,98],
  education:     [99,100,101,102,103],
  health:        [104,105,106,107,108],
  psychology:    [109,110,111,112,113,114,115,116,117,118],
  relationships: [119,120,121,122,123,124,125,126,127],
};

const DIM_TO_CATEGORY: Record<number, Category> = (() => {
  const m: Record<number, Category> = {};
  for (const [cat, dims] of Object.entries(CATEGORY_DIMS)) {
    for (const d of dims) m[d] = cat as Category;
  }
  return m;
})();

type Archetype =
  | 'us_evangelical_boomer'
  | 'us_secular_millennial_urban'
  | 'us_rural_conservative'
  | 'us_genz_progressive'
  | 'nordic_secular_progressive'
  | 'german_social_dem'
  | 'indian_traditional_hindu'
  | 'japanese_secular_conservative'
  | 'brazilian_evangelical_right'
  | 'mexican_catholic_populist'
  | 'uk_pragmatic_centrist'
  | 'french_laicite_left';

interface ArchetypeProfile {
  label: string;
  countries: { code: string; zips: string[]; weight: number }[];
  genderDist: { M: number; F: number; NB: number; PNS: number; Intersex: number };
  birthYearRange: [number, number];
  categoryMeans: Record<Category, number>;
  dimOverrides: Record<number, number>;
  variance: number;
  skipRate: number;
}

const PROFILES: Record<Archetype, ArchetypeProfile> = {
  us_evangelical_boomer: {
    label: 'US Evangelical Boomer',
    countries: [{ code: '840', zips: ['37201','35201','73101','72201','29201'], weight: 1 }],
    genderDist: { M: 48, F: 49, NB: 1, PNS: 2, Intersex: 0 },
    birthYearRange: [1946, 1964],
    categoryMeans: { epistemology: 6, spirituality: 8, morality: 7, politics: 7, social: 7, economics: 7, science_tech: 4, education: 6, health: 5, psychology: 6, relationships: 8 },
    dimOverrides: {
      6: 4, 8: 2, 12: 9, 13: 3,
      14: 9, 15: 9, 16: 9, 17: 9, 18: 9, 22: 9, 23: 9, 26: 2, 27: 2,
      34: 3, 35: 1, 36: 8, 38: 3, 39: 9,
      44: 8, 46: 9, 47: 2, 48: 9, 49: 8, 50: 9, 51: 3, 52: 9, 54: 2, 55: 2, 56: 9, 57: 2, 61: 9,
      64: 9, 65: 9, 69: 3, 70: 2, 71: 8, 72: 1, 74: 8, 75: 1, 76: 2, 77: 9,
      82: 1, 84: 3, 85: 2,
      90: 3, 91: 2, 94: 4, 98: 2,
      106: 3, 108: 3,
      109: 9, 118: 4,
      119: 9, 120: 9, 121: 9,
    },
    variance: 1.3,
    skipRate: 0.05,
  },

  us_secular_millennial_urban: {
    label: 'US Secular Millennial (Urban)',
    countries: [{ code: '840', zips: ['11201','94110','60601','02139','90210'], weight: 1 }],
    genderDist: { M: 42, F: 48, NB: 7, PNS: 2, Intersex: 1 },
    birthYearRange: [1981, 1996],
    categoryMeans: { epistemology: 6, spirituality: 3, morality: 6, politics: 3, social: 3, economics: 3, science_tech: 7, education: 6, health: 6, psychology: 6, relationships: 5 },
    dimOverrides: {
      6: 9, 8: 7, 10: 8, 12: 3, 13: 8,
      14: 2, 15: 2, 16: 2, 18: 1, 22: 1, 23: 1,
      34: 8, 35: 9, 36: 2, 37: 7, 38: 9,
      44: 2, 46: 3, 47: 8, 48: 2, 51: 8, 52: 2, 54: 9, 55: 9, 57: 8, 62: 6,
      65: 2, 68: 8, 69: 8, 70: 9, 73: 9, 76: 8,
      82: 7, 84: 9, 85: 7,
      90: 7, 91: 6, 93: 5, 94: 9, 96: 8,
      106: 9, 108: 9,
    },
    variance: 1.3,
    skipRate: 0.04,
  },

  us_rural_conservative: {
    label: 'US Rural Conservative',
    countries: [{ code: '840', zips: ['38801','27801','25401','62301','82801'], weight: 1 }],
    genderDist: { M: 51, F: 46, NB: 1, PNS: 2, Intersex: 0 },
    birthYearRange: [1955, 1985],
    categoryMeans: { epistemology: 6, spirituality: 7, morality: 7, politics: 7, social: 7, economics: 7, science_tech: 4, education: 5, health: 5, psychology: 6, relationships: 8 },
    dimOverrides: {
      13: 3,
      14: 9, 15: 8, 22: 8,
      35: 2, 36: 8, 38: 3, 39: 8,
      44: 9, 46: 8, 48: 9, 50: 8, 52: 9, 53: 8, 54: 2, 55: 2, 56: 9, 57: 2, 58: 9, 59: 9,
      64: 9, 65: 9, 69: 3, 70: 3, 71: 8, 74: 8, 77: 8,
      80: 6, 81: 6, 82: 2,
      90: 3, 94: 3, 96: 9, 108: 3,
    },
    variance: 1.3,
    skipRate: 0.07,
  },

  us_genz_progressive: {
    label: 'US Gen Z Progressive',
    countries: [{ code: '840', zips: ['11201','94110','60601','02139','78701'], weight: 1 }],
    genderDist: { M: 38, F: 45, NB: 12, PNS: 3, Intersex: 2 },
    birthYearRange: [1997, 2005],
    categoryMeans: { epistemology: 6, spirituality: 2, morality: 6, politics: 2, social: 2, economics: 2, science_tech: 7, education: 6, health: 6, psychology: 6, relationships: 5 },
    dimOverrides: {
      6: 8, 8: 8, 10: 9, 12: 2, 13: 8,
      14: 1, 15: 1, 22: 1,
      34: 9, 35: 9, 37: 9, 38: 9,
      44: 2, 46: 2, 47: 9, 48: 1, 51: 9, 52: 1, 54: 9, 55: 9, 57: 9, 60: 7,
      65: 1, 68: 9, 69: 9, 70: 9, 72: 3, 73: 9, 74: 2, 76: 9,
      79: 3, 82: 8, 84: 9, 85: 8,
      90: 5, 94: 9, 95: 3, 96: 7,
      106: 9, 108: 9,
      105: 9,
    },
    variance: 1.1,
    skipRate: 0.04,
  },

  nordic_secular_progressive: {
    label: 'Nordic Secular Progressive',
    countries: [
      { code: '752', zips: ['11122','21111','40010','50212','90325'], weight: 60 },
      { code: '528', zips: ['10120','30115','50111','70111','90120'], weight: 40 },
    ],
    genderDist: { M: 44, F: 47, NB: 6, PNS: 2, Intersex: 1 },
    birthYearRange: [1960, 2003],
    categoryMeans: { epistemology: 6, spirituality: 2, morality: 7, politics: 3, social: 3, economics: 3, science_tech: 7, education: 7, health: 7, psychology: 6, relationships: 6 },
    dimOverrides: {
      14: 1, 15: 1, 16: 2, 17: 2, 18: 1, 22: 1, 23: 1, 26: 2,
      35: 9, 36: 1, 37: 8, 38: 9, 39: 3,
      45: 9, 46: 3, 47: 9, 51: 9, 52: 1, 54: 9, 55: 8, 57: 8, 62: 8,
      64: 3, 65: 2, 69: 8, 70: 9, 71: 1, 73: 8, 76: 7,
      80: 9, 81: 9, 82: 7, 84: 9, 85: 8,
      90: 6, 91: 7, 94: 9, 96: 8,
      108: 9,
      112: 8,
    },
    variance: 1.0,
    skipRate: 0.03,
  },

  german_social_dem: {
    label: 'German Social Democrat',
    countries: [{ code: '276', zips: ['10115','80331','20095','50667','60311'], weight: 1 }],
    genderDist: { M: 47, F: 48, NB: 3, PNS: 2, Intersex: 0 },
    birthYearRange: [1955, 2000],
    categoryMeans: { epistemology: 6, spirituality: 3, morality: 6, politics: 4, social: 4, economics: 3, science_tech: 5, education: 6, health: 7, psychology: 6, relationships: 6 },
    dimOverrides: {
      14: 3, 15: 3, 22: 2,
      35: 8, 37: 8, 38: 9,
      45: 9, 46: 4, 51: 9, 54: 9, 55: 7, 57: 8, 62: 6,
      65: 3, 70: 8, 73: 7,
      80: 9, 81: 9, 83: 8, 84: 9, 85: 7,
      93: 3, 94: 7, 96: 9,
      108: 9,
    },
    variance: 1.2,
    skipRate: 0.05,
  },

  indian_traditional_hindu: {
    label: 'Indian Traditional Hindu',
    countries: [{ code: '356', zips: ['11000','40000','60000','70000','80000'], weight: 1 }],
    genderDist: { M: 52, F: 45, NB: 1, PNS: 2, Intersex: 0 },
    birthYearRange: [1955, 2002],
    categoryMeans: { epistemology: 6, spirituality: 8, morality: 7, politics: 6, social: 7, economics: 5, science_tech: 6, education: 7, health: 6, psychology: 6, relationships: 8 },
    dimOverrides: {
      12: 9,
      14: 9, 15: 9, 17: 9, 19: 9, 20: 9, 22: 9, 23: 8, 27: 9, 28: 9, 26: 7,
      32: 9, 35: 3, 37: 8,
      45: 7, 49: 8, 51: 7, 55: 3, 59: 9,
      64: 9, 65: 9, 66: 8, 71: 8, 77: 9,
      80: 6, 82: 6, 84: 6,
      90: 6, 94: 7,
      99: 9, 100: 7,
      107: 7,
      117: 9,
      119: 9, 120: 9, 121: 9, 122: 9,
    },
    variance: 1.3,
    skipRate: 0.08,
  },

  japanese_secular_conservative: {
    label: 'Japanese Secular Conservative',
    countries: [{ code: '392', zips: ['10000','15000','53000','60001','81001'], weight: 1 }],
    genderDist: { M: 50, F: 48, NB: 1, PNS: 1, Intersex: 0 },
    birthYearRange: [1950, 2000],
    categoryMeans: { epistemology: 6, spirituality: 3, morality: 6, politics: 6, social: 6, economics: 5, science_tech: 7, education: 7, health: 7, psychology: 5, relationships: 7 },
    dimOverrides: {
      14: 2, 15: 2, 18: 2,
      17: 6, 19: 6, 20: 6, 27: 6, 28: 6,
      30: 3,
      45: 7, 48: 7, 49: 6, 55: 2, 56: 8, 59: 6,
      64: 7, 66: 9, 70: 4, 71: 6, 73: 3,
      82: 3,
      89: 8, 90: 8, 91: 6, 92: 8, 97: 5,
      104: 9,
      114: 7,
    },
    variance: 1.2,
    skipRate: 0.06,
  },

  brazilian_evangelical_right: {
    label: 'Brazilian Evangelical Right',
    countries: [{ code: '076', zips: ['01310','20040','30130','40010','50030'], weight: 1 }],
    genderDist: { M: 49, F: 48, NB: 1, PNS: 2, Intersex: 0 },
    birthYearRange: [1960, 2000],
    categoryMeans: { epistemology: 6, spirituality: 7, morality: 7, politics: 6, social: 7, economics: 5, science_tech: 5, education: 5, health: 6, psychology: 6, relationships: 8 },
    dimOverrides: {
      14: 9, 15: 9, 16: 9, 18: 9, 22: 9, 23: 9,
      35: 2, 36: 8, 39: 9,
      44: 8, 46: 7, 50: 8, 52: 8, 55: 3, 56: 9,
      64: 9, 65: 9, 70: 2, 71: 8, 77: 8,
      82: 4, 84: 6,
      94: 5,
      105: 6,
      119: 9, 120: 9, 121: 9,
    },
    variance: 1.3,
    skipRate: 0.07,
  },

  mexican_catholic_populist: {
    label: 'Mexican Catholic Populist',
    countries: [{ code: '484', zips: ['01000','03000','06000','44100','64000'], weight: 1 }],
    genderDist: { M: 49, F: 48, NB: 1, PNS: 2, Intersex: 0 },
    birthYearRange: [1958, 2002],
    categoryMeans: { epistemology: 6, spirituality: 7, morality: 6, politics: 5, social: 6, economics: 4, science_tech: 5, education: 5, health: 6, psychology: 6, relationships: 7 },
    dimOverrides: {
      14: 9, 15: 8, 16: 9, 17: 9, 18: 8, 20: 7, 23: 7,
      35: 3, 37: 6,
      47: 7, 51: 8, 54: 7, 59: 7,
      64: 8, 65: 8, 70: 4, 78: 8,
      80: 8, 82: 6, 84: 7, 85: 7,
      99: 7,
      108: 8,
      119: 8, 120: 8, 121: 8, 122: 8,
    },
    variance: 1.3,
    skipRate: 0.07,
  },

  uk_pragmatic_centrist: {
    label: 'UK Pragmatic Centrist',
    countries: [{ code: '826', zips: ['SW1A1','EC1A1','M11AE','B11AA','LS11UR'], weight: 1 }],
    genderDist: { M: 47, F: 48, NB: 3, PNS: 2, Intersex: 0 },
    birthYearRange: [1955, 2003],
    categoryMeans: { epistemology: 6, spirituality: 4, morality: 5, politics: 5, social: 5, economics: 5, science_tech: 6, education: 6, health: 6, psychology: 6, relationships: 6 },
    dimOverrides: {
      14: 3, 15: 4, 22: 3,
      35: 7, 37: 7, 38: 7,
      45: 8, 46: 5, 51: 7, 54: 7, 55: 5, 57: 6, 62: 7,
      70: 7, 73: 6,
      80: 7, 84: 7,
      94: 7,
      108: 9,
    },
    variance: 1.4,
    skipRate: 0.06,
  },

  french_laicite_left: {
    label: 'French Laïcité Left',
    countries: [{ code: '250', zips: ['75001','69001','13001','31000','44000'], weight: 1 }],
    genderDist: { M: 47, F: 48, NB: 3, PNS: 2, Intersex: 0 },
    birthYearRange: [1955, 2003],
    categoryMeans: { epistemology: 6, spirituality: 2, morality: 6, politics: 3, social: 4, economics: 3, science_tech: 5, education: 6, health: 7, psychology: 6, relationships: 5 },
    dimOverrides: {
      14: 2, 15: 1, 22: 1, 26: 2,
      35: 8, 37: 8, 38: 8,
      45: 8, 46: 3, 51: 9, 54: 8, 55: 5, 57: 9, 62: 7,
      65: 3, 70: 8, 73: 5, 77: 6,
      80: 9, 81: 9, 84: 9, 85: 8,
      94: 7, 96: 8,
      108: 9,
    },
    variance: 1.3,
    skipRate: 0.05,
  },
};

interface TimelineMix {
  weeksAgo: number;
  count: number;
  mix: { archetype: Archetype; w: number }[];
}

const CONSERVATIVE_HEAVY: { archetype: Archetype; w: number }[] = [
  { archetype: 'us_evangelical_boomer', w: 18 },
  { archetype: 'us_rural_conservative', w: 18 },
  { archetype: 'indian_traditional_hindu', w: 20 },
  { archetype: 'brazilian_evangelical_right', w: 14 },
  { archetype: 'mexican_catholic_populist', w: 10 },
  { archetype: 'japanese_secular_conservative', w: 8 },
  { archetype: 'uk_pragmatic_centrist', w: 6 },
  { archetype: 'german_social_dem', w: 3 },
  { archetype: 'us_secular_millennial_urban', w: 2 },
  { archetype: 'nordic_secular_progressive', w: 1 },
];

const BALANCED: { archetype: Archetype; w: number }[] = [
  { archetype: 'us_evangelical_boomer', w: 10 },
  { archetype: 'us_rural_conservative', w: 10 },
  { archetype: 'indian_traditional_hindu', w: 12 },
  { archetype: 'brazilian_evangelical_right', w: 8 },
  { archetype: 'mexican_catholic_populist', w: 7 },
  { archetype: 'japanese_secular_conservative', w: 8 },
  { archetype: 'uk_pragmatic_centrist', w: 10 },
  { archetype: 'german_social_dem', w: 9 },
  { archetype: 'french_laicite_left', w: 7 },
  { archetype: 'us_secular_millennial_urban', w: 8 },
  { archetype: 'us_genz_progressive', w: 5 },
  { archetype: 'nordic_secular_progressive', w: 6 },
];

const PROGRESSIVE_HEAVY: { archetype: Archetype; w: number }[] = [
  { archetype: 'nordic_secular_progressive', w: 20 },
  { archetype: 'us_genz_progressive', w: 18 },
  { archetype: 'us_secular_millennial_urban', w: 16 },
  { archetype: 'french_laicite_left', w: 14 },
  { archetype: 'german_social_dem', w: 12 },
  { archetype: 'uk_pragmatic_centrist', w: 8 },
  { archetype: 'japanese_secular_conservative', w: 4 },
  { archetype: 'mexican_catholic_populist', w: 3 },
  { archetype: 'us_rural_conservative', w: 2 },
  { archetype: 'indian_traditional_hindu', w: 3 },
];

function blend(
  a: { archetype: Archetype; w: number }[],
  b: { archetype: Archetype; w: number }[],
  t: number
): { archetype: Archetype; w: number }[] {
  const keys = new Set([...a.map(x => x.archetype), ...b.map(x => x.archetype)]);
  const aMap = Object.fromEntries(a.map(x => [x.archetype, x.w]));
  const bMap = Object.fromEntries(b.map(x => [x.archetype, x.w]));
  return Array.from(keys).map(k => ({
    archetype: k as Archetype,
    w: (aMap[k] || 0) * (1 - t) + (bMap[k] || 0) * t,
  }));
}

const TIMELINE: TimelineMix[] = [
  { weeksAgo: 13, count: 320, mix: CONSERVATIVE_HEAVY },
  { weeksAgo: 12, count: 320, mix: CONSERVATIVE_HEAVY },
  { weeksAgo: 11, count: 320, mix: blend(CONSERVATIVE_HEAVY, BALANCED, 0.3) },
  { weeksAgo: 10, count: 320, mix: blend(CONSERVATIVE_HEAVY, BALANCED, 0.5) },
  { weeksAgo: 9,  count: 320, mix: blend(CONSERVATIVE_HEAVY, BALANCED, 0.8) },
  { weeksAgo: 8,  count: 340, mix: BALANCED },
  { weeksAgo: 7,  count: 340, mix: BALANCED },
  { weeksAgo: 6,  count: 340, mix: blend(BALANCED, PROGRESSIVE_HEAVY, 0.3) },
  { weeksAgo: 5,  count: 340, mix: blend(BALANCED, PROGRESSIVE_HEAVY, 0.55) },
  { weeksAgo: 4,  count: 360, mix: blend(BALANCED, PROGRESSIVE_HEAVY, 0.75) },
  { weeksAgo: 3,  count: 360, mix: PROGRESSIVE_HEAVY },
  { weeksAgo: 2,  count: 380, mix: PROGRESSIVE_HEAVY },
  { weeksAgo: 1,  count: 380, mix: PROGRESSIVE_HEAVY },
  { weeksAgo: 0,  count: 380, mix: PROGRESSIVE_HEAVY },
];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(a: number, b: number) { return Math.floor(Math.random() * (b - a + 1)) + a; }

function pickWeighted<T>(items: { item: T; w: number }[]): T {
  const total = items.reduce((s, i) => s + i.w, 0);
  let r = Math.random() * total;
  for (const i of items) {
    r -= i.w;
    if (r <= 0) return i.item;
  }
  return items[items.length - 1].item;
}

function randNormal(mean: number, stddev: number): number {
  const u1 = Math.random() || 1e-9;
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stddev;
}

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

function sampleDimValue(profile: ArchetypeProfile, dimId: number): string {
  if (Math.random() < profile.skipRate) return '.';
  const override = profile.dimOverrides[dimId];
  const cat = DIM_TO_CATEGORY[dimId];
  const mean = override !== undefined ? override : profile.categoryMeans[cat];
  const raw = randNormal(mean, profile.variance);
  return String(clamp(Math.round(raw), 0, 9));
}

function pickGender(dist: ArchetypeProfile['genderDist']): { code: string; label: string } {
  const map = [
    { code: '1', label: 'M', w: dist.M },
    { code: '0', label: 'F', w: dist.F },
    { code: '9', label: 'NB', w: dist.NB },
    { code: '5', label: 'PNS', w: dist.PNS },
    { code: '2', label: 'Intersex', w: dist.Intersex },
  ].map(x => ({ item: x, w: x.w }));
  return pickWeighted(map);
}

function buildDna(profile: ArchetypeProfile, birthYear: number, birthMonth: number, birthDay: number, genderCode: string, countryCode: string, zip: string): string {
  const century = birthYear >= 2000 ? '1' : '0';
  const yy = String(birthYear % 100).padStart(2, '0');
  const mm = String(birthMonth).padStart(2, '0');
  const dd = String(birthDay).padStart(2, '0');
  const meta = `${century}${yy}${mm}${dd}${genderCode}${countryCode}${zip}`;
  let beliefs = '';
  for (let dimId = 4; dimId < 128; dimId++) {
    beliefs += sampleDimValue(profile, dimId);
  }
  return meta + beliefs;
}

function parseDna(dna: string) {
  const century = parseInt(dna[0]) || 0;
  const birthYear = (century === 0 ? 1900 : 2000) + (parseInt(dna.slice(1, 3)) || 0);
  const birthMonth = parseInt(dna.slice(3, 5)) || 0;
  const birthDay = parseInt(dna.slice(5, 7)) || 0;
  const genderMap: Record<string, string> = { '0': 'F', '1': 'M', '2': 'Intersex', '5': 'PNS', '9': 'NB' };
  const gender = genderMap[dna[7]] || 'PNS';
  const countryCode = dna.slice(8, 11);
  const zipCode = dna.slice(11, 16);
  const beliefValues: Record<string, number | null> = {};
  let dimensionsExplored = 0;
  for (let i = 16; i < 140 && i < dna.length; i++) {
    const ch = dna[i];
    const dimId = i - 16 + 4;
    if (ch === '.') beliefValues[String(dimId)] = null;
    else {
      const v = parseInt(ch);
      if (!isNaN(v)) { beliefValues[String(dimId)] = v; dimensionsExplored++; }
      else beliefValues[String(dimId)] = null;
    }
  }
  return { century, birthYear, birthMonth, birthDay, gender, countryCode, zipCode, beliefValues, dimensionsExplored };
}

async function main() {
  console.log('[seed] Wiping previous test submissions...');
  await db.delete(genomeSubmissions).where(eq(genomeSubmissions.isTestData, true));
  console.log('[seed] Wipe complete.');

  const total = TIMELINE.reduce((s, b) => s + b.count, 0);
  console.log(`[seed] Generating ${total} research-grounded submissions across ${TIMELINE.length} weekly buckets...`);
  console.log(`[seed] Using ${Object.keys(PROFILES).length} demographic archetypes rooted in Pew / WVS / Ipsos / PRRI data.`);

  const rows: any[] = [];
  const now = Date.now();
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const archetypeCounts: Record<string, number> = {};

  for (const bucket of TIMELINE) {
    const weighted = bucket.mix.map(m => ({ item: m.archetype, w: m.w }));
    for (let i = 0; i < bucket.count; i++) {
      const archetype = pickWeighted(weighted);
      archetypeCounts[archetype] = (archetypeCounts[archetype] || 0) + 1;
      const profile = PROFILES[archetype];

      const country = pickWeighted(profile.countries.map(c => ({ item: c, w: c.weight })));
      const zip = pick(country.zips);
      const gender = pickGender(profile.genderDist);
      const [byLo, byHi] = profile.birthYearRange;
      const birthYear = randInt(byLo, Math.min(byHi, 2005));
      const birthMonth = randInt(1, 12);
      const birthDay = randInt(1, 28);

      const dna = buildDna(profile, birthYear, birthMonth, birthDay, gender.code, country.code, zip);
      const parsed = parseDna(dna);
      const anonymousKey = crypto.randomBytes(32).toString('hex');

      const bucketStart = now - bucket.weeksAgo * WEEK_MS;
      const submittedAt = new Date(bucketStart - Math.floor(Math.random() * WEEK_MS));

      rows.push({
        anonymousKey,
        dnaString: dna,
        demographicPrefix: dna.slice(0, 16),
        century: parsed.century,
        birthYear: parsed.birthYear,
        birthMonth: parsed.birthMonth,
        birthDay: parsed.birthDay,
        gender: parsed.gender,
        countryCode: parsed.countryCode,
        zipCode: parsed.zipCode,
        beliefValues: parsed.beliefValues,
        dimensionsExplored: parsed.dimensionsExplored,
        isTestData: true,
        submittedAt,
        updatedAt: submittedAt,
      });
    }
  }

  console.log(`[seed] Inserting ${rows.length} rows in batches...`);
  const BATCH = 50;
  for (let i = 0; i < rows.length; i += BATCH) {
    await db.insert(genomeSubmissions).values(rows.slice(i, i + BATCH));
  }

  console.log(`\n[seed] === Archetype distribution ===`);
  const sorted = Object.entries(archetypeCounts).sort((a, b) => b[1] - a[1]);
  for (const [a, n] of sorted) {
    console.log(`  ${PROFILES[a as Archetype].label.padEnd(38)} ${String(n).padStart(4)}`);
  }
  console.log(`[seed] Done. ${rows.length} research-grounded test submissions inserted.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
