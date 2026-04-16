/**
 * Shared seed logic for Explore test data. Used by:
 *   - scripts/seed-explore-fake-users.ts (CLI / dev)
 *   - routes/admin.ts  (one-shot endpoint to seed production)
 *
 * All rows insert with is_test_data = true. Removable with cleanup script
 * or the DELETE /admin/test-data endpoint.
 */

import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db, genomeSubmissions } from '@workspace/db';

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

const TRAJECTORIES: Record<Category, number[]> = {
  epistemology:  [ 1.8,  1.7,  1.6,  1.5,  1.4,  1.3,  1.2,  1.0,  0.9,  0.8,  0.7,  0.6,  0.5,  0.4],
  spirituality:  [ 2.6,  2.3,  1.8,  1.2,  0.6, -0.1, -0.8, -1.4, -1.8, -2.1, -2.3, -2.4, -2.5, -2.5],
  morality:      [ 1.5,  1.5,  1.4,  1.4,  1.3,  1.3,  1.3,  1.2,  1.2,  1.1,  1.1,  1.0,  1.0,  1.0],
  politics:      [-1.8, -1.4, -0.8, -0.2,  0.3,  0.7,  1.0,  1.1,  0.9,  0.5,  0.0, -0.4, -0.7, -1.0],
  social:        [-2.4, -1.9, -1.3, -0.7, -0.1,  0.5,  1.1,  1.6,  2.0,  2.3,  2.4,  2.5,  2.5,  2.5],
  economics:     [ 1.8,  1.5,  1.1,  0.7,  0.3, -0.1, -0.5, -0.9, -1.2, -1.4, -1.6, -1.7, -1.8, -1.8],
  science_tech:  [ 2.2,  2.0,  1.7,  1.4,  1.0,  0.6,  0.2, -0.1, -0.4, -0.6, -0.8, -0.9, -1.0, -1.0],
  education:     [ 0.8,  0.6,  0.4,  0.2,  0.0, -0.2, -0.4, -0.6, -0.8, -0.9, -1.0, -1.1, -1.2, -1.3],
  health:        [-1.5, -1.2, -0.9, -0.5, -0.1,  0.3,  0.7,  1.0,  1.3,  1.6,  1.8,  1.9,  2.0,  2.1],
  psychology:    [-0.4, -0.2,  0.0,  0.2,  0.4,  0.6,  0.8,  1.0,  1.2,  1.4,  1.5,  1.6,  1.7,  1.8],
  relationships: [ 2.3,  2.1,  1.9,  1.6,  1.3,  1.0,  0.7,  0.3,  0.0, -0.3, -0.5, -0.7, -0.8, -0.9],
};

type Archetype =
  | 'us_evangelical_boomer' | 'us_secular_millennial_urban' | 'us_rural_conservative'
  | 'us_genz_progressive' | 'nordic_secular_progressive' | 'german_social_dem'
  | 'indian_traditional_hindu' | 'japanese_secular_conservative'
  | 'brazilian_evangelical_right' | 'mexican_catholic_populist'
  | 'uk_pragmatic_centrist' | 'french_laicite_left';

interface ArchetypeProfile {
  label: string;
  countries: { code: string; zips: string[]; weight: number }[];
  genderDist: { M: number; F: number; NB: number; PNS: number; Intersex: number };
  birthYearRange: [number, number];
  dimSignatures: Record<number, number>;
  signatureStrength: number;
  skipRate: number;
}

const PROFILES: Record<Archetype, ArchetypeProfile> = {
  us_evangelical_boomer: {
    label: 'US Evangelical Boomer',
    countries: [{ code: '840', zips: ['37201','35201','73101','72201','29201'], weight: 1 }],
    genderDist: { M: 48, F: 49, NB: 1, PNS: 2, Intersex: 0 },
    birthYearRange: [1946, 1964],
    dimSignatures: { 14:9,15:9,16:9,17:9,18:9,22:9,23:9,26:2,27:2,35:1,36:8,48:9,50:9,52:9,61:9,64:9,65:9,70:2,71:8,72:1,74:8,75:1,119:9,120:9,121:9 },
    signatureStrength: 0.75, skipRate: 0.05,
  },
  us_secular_millennial_urban: {
    label: 'US Secular Millennial (Urban)',
    countries: [{ code: '840', zips: ['11201','94110','60601','02139','90210'], weight: 1 }],
    genderDist: { M: 42, F: 48, NB: 7, PNS: 2, Intersex: 1 },
    birthYearRange: [1981, 1996],
    dimSignatures: { 14:2,15:2,22:1,35:9,38:9,52:2,54:9,55:9,70:9,73:9,84:9,85:7,96:8,106:9,108:9 },
    signatureStrength: 0.65, skipRate: 0.04,
  },
  us_rural_conservative: {
    label: 'US Rural Conservative',
    countries: [{ code: '840', zips: ['38801','27801','25401','62301','82801'], weight: 1 }],
    genderDist: { M: 51, F: 46, NB: 1, PNS: 2, Intersex: 0 },
    birthYearRange: [1955, 1985],
    dimSignatures: { 14:9,15:8,48:9,50:8,52:9,53:8,54:2,55:2,57:2,58:9,59:9,64:9,65:9,70:2,82:2,94:3,96:9 },
    signatureStrength: 0.70, skipRate: 0.07,
  },
  us_genz_progressive: {
    label: 'US Gen Z Progressive',
    countries: [{ code: '840', zips: ['11201','94110','60601','02139','78701'], weight: 1 }],
    genderDist: { M: 38, F: 45, NB: 12, PNS: 3, Intersex: 2 },
    birthYearRange: [1997, 2005],
    dimSignatures: { 14:1,15:1,22:1,35:9,38:9,52:1,54:9,55:9,68:9,70:9,73:9,76:9,82:9,84:9,85:9,94:9,106:9,108:9 },
    signatureStrength: 0.70, skipRate: 0.04,
  },
  nordic_secular_progressive: {
    label: 'Nordic Secular Progressive',
    countries: [
      { code: '752', zips: ['11122','21111','40010','50212','90325'], weight: 60 },
      { code: '528', zips: ['10120','30115','50111','70111','90120'], weight: 40 },
    ],
    genderDist: { M: 44, F: 47, NB: 6, PNS: 2, Intersex: 1 },
    birthYearRange: [1960, 2003],
    dimSignatures: { 14:1,15:1,16:2,18:1,22:1,23:1,35:9,51:9,54:9,55:8,57:8,70:9,73:8,80:9,81:9,84:9,85:8,94:9,108:9 },
    signatureStrength: 0.75, skipRate: 0.03,
  },
  german_social_dem: {
    label: 'German Social Democrat',
    countries: [{ code: '276', zips: ['10115','80331','20095','50667','60311'], weight: 1 }],
    genderDist: { M: 47, F: 48, NB: 3, PNS: 2, Intersex: 0 },
    birthYearRange: [1955, 2000],
    dimSignatures: { 14:3,22:2,51:9,54:9,57:8,70:8,80:9,81:9,84:9,96:9,108:9 },
    signatureStrength: 0.55, skipRate: 0.05,
  },
  indian_traditional_hindu: {
    label: 'Indian Traditional Hindu',
    countries: [{ code: '356', zips: ['11000','40000','60000','70000','80000'], weight: 1 }],
    genderDist: { M: 52, F: 45, NB: 1, PNS: 2, Intersex: 0 },
    birthYearRange: [1955, 2002],
    dimSignatures: { 14:9,15:9,17:9,19:9,20:9,22:9,27:9,28:9,64:9,65:9,66:8,71:8,77:9,51:7,84:6,119:9,120:9,121:9,122:9 },
    signatureStrength: 0.80, skipRate: 0.08,
  },
  japanese_secular_conservative: {
    label: 'Japanese Secular Conservative',
    countries: [{ code: '392', zips: ['10000','15000','53000','60001','81001'], weight: 1 }],
    genderDist: { M: 50, F: 48, NB: 1, PNS: 1, Intersex: 0 },
    birthYearRange: [1950, 2000],
    dimSignatures: { 14:2,15:2,22:2,56:8,66:9,71:6,73:3,89:8,90:8,92:8,104:9 },
    signatureStrength: 0.55, skipRate: 0.06,
  },
  brazilian_evangelical_right: {
    label: 'Brazilian Evangelical Right',
    countries: [{ code: '076', zips: ['01310','20040','30130','40010','50030'], weight: 1 }],
    genderDist: { M: 49, F: 48, NB: 1, PNS: 2, Intersex: 0 },
    birthYearRange: [1960, 2000],
    dimSignatures: { 14:9,15:9,16:9,22:9,23:9,50:8,52:8,56:9,64:9,65:9,70:2,71:8,119:9,120:9 },
    signatureStrength: 0.70, skipRate: 0.07,
  },
  mexican_catholic_populist: {
    label: 'Mexican Catholic Populist',
    countries: [{ code: '484', zips: ['01000','03000','06000','44100','64000'], weight: 1 }],
    genderDist: { M: 49, F: 48, NB: 1, PNS: 2, Intersex: 0 },
    birthYearRange: [1958, 2002],
    dimSignatures: { 14:9,15:8,16:9,17:9,22:7,51:8,64:8,65:8,80:8,85:7,119:8,120:8 },
    signatureStrength: 0.60, skipRate: 0.07,
  },
  uk_pragmatic_centrist: {
    label: 'UK Pragmatic Centrist',
    countries: [{ code: '826', zips: ['SW1A1','EC1A1','M11AE','B11AA','LS11UR'], weight: 1 }],
    genderDist: { M: 47, F: 48, NB: 3, PNS: 2, Intersex: 0 },
    birthYearRange: [1955, 2003],
    dimSignatures: { 14:3,22:3,51:7,54:7,70:7,108:9 },
    signatureStrength: 0.35, skipRate: 0.06,
  },
  french_laicite_left: {
    label: 'French Laïcité Left',
    countries: [{ code: '250', zips: ['75001','69001','13001','31000','44000'], weight: 1 }],
    genderDist: { M: 47, F: 48, NB: 3, PNS: 2, Intersex: 0 },
    birthYearRange: [1955, 2003],
    dimSignatures: { 14:2,15:1,22:1,26:2,51:9,54:8,57:9,70:8,80:9,84:9,108:9 },
    signatureStrength: 0.65, skipRate: 0.05,
  },
};

const ARCHETYPE_MIX: { archetype: Archetype; w: number }[] = [
  { archetype: 'us_evangelical_boomer', w: 8 },
  { archetype: 'us_secular_millennial_urban', w: 10 },
  { archetype: 'us_rural_conservative', w: 8 },
  { archetype: 'us_genz_progressive', w: 10 },
  { archetype: 'nordic_secular_progressive', w: 9 },
  { archetype: 'german_social_dem', w: 9 },
  { archetype: 'indian_traditional_hindu', w: 12 },
  { archetype: 'japanese_secular_conservative', w: 7 },
  { archetype: 'brazilian_evangelical_right', w: 7 },
  { archetype: 'mexican_catholic_populist', w: 6 },
  { archetype: 'uk_pragmatic_centrist', w: 8 },
  { archetype: 'french_laicite_left', w: 6 },
];

const DEFAULT_USERS_PER_WEEK = 340;
const DEFAULT_WEEKS = 14;

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(a: number, b: number) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function pickWeighted<T>(items: { item: T; w: number }[]): T {
  const total = items.reduce((s, i) => s + i.w, 0);
  let r = Math.random() * total;
  for (const i of items) { r -= i.w; if (r <= 0) return i.item; }
  return items[items.length - 1].item;
}
function randNormal(mean: number, stddev: number): number {
  const u1 = Math.random() || 1e-9; const u2 = Math.random();
  return mean + Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * stddev;
}
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

function sampleDimValue(profile: ArchetypeProfile, dimId: number, weekIdx: number): string {
  if (Math.random() < profile.skipRate) return '.';
  const cat = DIM_TO_CATEGORY[dimId];
  const trajectoryRaw = TRAJECTORIES[cat][weekIdx] + 5;
  const sig = profile.dimSignatures[dimId];
  const mean = sig !== undefined
    ? profile.signatureStrength * sig + (1 - profile.signatureStrength) * trajectoryRaw
    : trajectoryRaw;
  const val = randNormal(mean, 1.6);
  return String(clamp(Math.round(val), 0, 9));
}

function pickGender(dist: ArchetypeProfile['genderDist']): { code: string; label: string } {
  return pickWeighted([
    { item: { code: '1', label: 'M' }, w: dist.M },
    { item: { code: '0', label: 'F' }, w: dist.F },
    { item: { code: '9', label: 'NB' }, w: dist.NB },
    { item: { code: '5', label: 'PNS' }, w: dist.PNS },
    { item: { code: '2', label: 'Intersex' }, w: dist.Intersex },
  ]);
}

function buildDna(profile: ArchetypeProfile, weekIdx: number, birthYear: number, birthMonth: number, birthDay: number, genderCode: string, countryCode: string, zip: string): string {
  const century = birthYear >= 2000 ? '1' : '0';
  const yy = String(birthYear % 100).padStart(2, '0');
  const mm = String(birthMonth).padStart(2, '0');
  const dd = String(birthDay).padStart(2, '0');
  const meta = `${century}${yy}${mm}${dd}${genderCode}${countryCode}${zip}`;
  let beliefs = '';
  for (let dimId = 4; dimId < 128; dimId++) {
    beliefs += sampleDimValue(profile, dimId, weekIdx);
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
    const ch = dna[i]; const dimId = i - 16 + 4;
    if (ch === '.') beliefValues[String(dimId)] = null;
    else {
      const v = parseInt(ch);
      if (!isNaN(v)) { beliefValues[String(dimId)] = v; dimensionsExplored++; }
      else beliefValues[String(dimId)] = null;
    }
  }
  return { century, birthYear, birthMonth, birthDay, gender, countryCode, zipCode, beliefValues, dimensionsExplored };
}

export interface SeedExploreOptions {
  usersPerWeek?: number;
  weeks?: number;
  /** If true, DELETE all existing is_test_data=true rows before inserting */
  wipeFirst?: boolean;
}

export interface SeedExploreResult {
  wiped: number;
  inserted: number;
  weeks: number;
  usersPerWeek: number;
  archetypeCounts: Record<string, number>;
}

export async function seedExploreData(opts: SeedExploreOptions = {}): Promise<SeedExploreResult> {
  const usersPerWeek = opts.usersPerWeek ?? DEFAULT_USERS_PER_WEEK;
  const weeks = opts.weeks ?? DEFAULT_WEEKS;
  const wipeFirst = opts.wipeFirst ?? true;

  let wiped = 0;
  if (wipeFirst) {
    const result = await db
      .delete(genomeSubmissions)
      .where(eq(genomeSubmissions.isTestData, true))
      .returning({ id: genomeSubmissions.id });
    wiped = result.length;
  }

  const rows: any[] = [];
  const now = Date.now();
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const weighted = ARCHETYPE_MIX.map(m => ({ item: m.archetype, w: m.w }));
  const archetypeCounts: Record<string, number> = {};

  for (let weeksAgo = weeks - 1; weeksAgo >= 0; weeksAgo--) {
    const weekIdx = Math.min((weeks - 1) - weeksAgo, TRAJECTORIES.spirituality.length - 1);
    for (let i = 0; i < usersPerWeek; i++) {
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

      const dna = buildDna(profile, weekIdx, birthYear, birthMonth, birthDay, gender.code, country.code, zip);
      const parsed = parseDna(dna);
      const anonymousKey = crypto.randomBytes(32).toString('hex');
      const bucketStart = now - weeksAgo * WEEK_MS;
      const submittedAt = new Date(bucketStart - Math.floor(Math.random() * WEEK_MS));

      rows.push({
        anonymousKey, dnaString: dna, demographicPrefix: dna.slice(0, 16),
        century: parsed.century, birthYear: parsed.birthYear, birthMonth: parsed.birthMonth, birthDay: parsed.birthDay,
        gender: parsed.gender, countryCode: parsed.countryCode, zipCode: parsed.zipCode,
        beliefValues: parsed.beliefValues, dimensionsExplored: parsed.dimensionsExplored,
        isTestData: true, submittedAt, updatedAt: submittedAt,
      });
    }
  }

  const BATCH = 50;
  for (let i = 0; i < rows.length; i += BATCH) {
    await db.insert(genomeSubmissions).values(rows.slice(i, i + BATCH));
  }

  return { wiped, inserted: rows.length, weeks, usersPerWeek, archetypeCounts };
}

export async function clearTestData(): Promise<number> {
  const result = await db
    .delete(genomeSubmissions)
    .where(eq(genomeSubmissions.isTestData, true))
    .returning({ id: genomeSubmissions.id });
  return result.length;
}
