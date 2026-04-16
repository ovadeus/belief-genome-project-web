import { db } from '@workspace/db';
import { genomeSubmissions } from '@workspace/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

type Lean = 'far_left' | 'left' | 'center' | 'right' | 'far_right';

const COUNTRY_PROFILES: { code: string; zips: string[]; lean: Lean }[] = [
  { code: '752', zips: ['11122', '21111', '40010', '50212', '90325'], lean: 'far_left' },
  { code: '528', zips: ['10120', '30115', '50111', '70111', '90120'], lean: 'far_left' },
  { code: '124', zips: ['M5V3A', 'V6B1A', 'H2X1Y', 'T2P0R', 'K1A0A'], lean: 'left' },
  { code: '276', zips: ['10115', '80331', '20095', '50667', '60311'], lean: 'left' },
  { code: '250', zips: ['75001', '69001', '13001', '31000', '44000'], lean: 'left' },
  { code: '826', zips: ['SW1A1', 'EC1A1', 'M11AE', 'B11AA', 'LS11UR'], lean: 'center' },
  { code: '036', zips: ['20001', '30001', '40001', '50001', '60001'], lean: 'center' },
  { code: '392', zips: ['10000', '15000', '53000', '60001', '81001'], lean: 'center' },
  { code: '840', zips: ['10001', '94110', '60601', '02139', '78701'], lean: 'center' },
  { code: '076', zips: ['01310', '20040', '30130', '40010', '50030'], lean: 'right' },
  { code: '484', zips: ['01000', '03000', '06000', '44100', '64000'], lean: 'right' },
  { code: '356', zips: ['11000', '40000', '60000', '70000', '80000'], lean: 'far_right' },
];

const GENDERS: { code: string; label: string; weight: number }[] = [
  { code: '0', label: 'F', weight: 45 },
  { code: '1', label: 'M', weight: 45 },
  { code: '9', label: 'NB', weight: 6 },
  { code: '5', label: 'PNS', weight: 3 },
  { code: '2', label: 'Intersex', weight: 1 },
];

function pickWeighted<T>(items: { item: T; w: number }[]): T {
  const total = items.reduce((s, i) => s + i.w, 0);
  let r = Math.random() * total;
  for (const i of items) {
    r -= i.w;
    if (r <= 0) return i.item;
  }
  return items[items.length - 1].item;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function beliefCharForLean(lean: Lean): string {
  switch (lean) {
    case 'far_left':
      return pickWeighted([
        { item: '9', w: 55 },
        { item: '8', w: 30 },
        { item: '7', w: 10 },
        { item: '.', w: 3 },
        { item: String(randInt(0, 4)), w: 2 },
      ]);
    case 'left':
      return pickWeighted([
        { item: String(randInt(7, 8)), w: 55 },
        { item: '9', w: 20 },
        { item: String(randInt(5, 6)), w: 17 },
        { item: '.', w: 3 },
        { item: String(randInt(0, 4)), w: 5 },
      ]);
    case 'center':
      return pickWeighted([
        { item: '5', w: 30 },
        { item: String(randInt(3, 4)), w: 25 },
        { item: String(randInt(6, 7)), w: 25 },
        { item: String(randInt(0, 2)), w: 8 },
        { item: String(randInt(8, 9)), w: 8 },
        { item: '.', w: 4 },
      ]);
    case 'right':
      return pickWeighted([
        { item: String(randInt(1, 2)), w: 55 },
        { item: '0', w: 20 },
        { item: String(randInt(3, 4)), w: 17 },
        { item: '.', w: 3 },
        { item: String(randInt(5, 9)), w: 5 },
      ]);
    case 'far_right':
      return pickWeighted([
        { item: '0', w: 55 },
        { item: '1', w: 30 },
        { item: '2', w: 10 },
        { item: '.', w: 3 },
        { item: String(randInt(5, 9)), w: 2 },
      ]);
  }
}

function buildDna(opts: {
  lean: Lean;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  genderCode: string;
  countryCode: string;
  zip: string;
}): string {
  const { lean, birthYear, birthMonth, birthDay, genderCode, countryCode, zip } = opts;
  const century = birthYear >= 2000 ? '1' : '0';
  const yearInCentury = String(birthYear % 100).padStart(2, '0');
  const month = String(birthMonth).padStart(2, '0');
  const day = String(birthDay).padStart(2, '0');
  const meta = `${century}${yearInCentury}${month}${day}${genderCode}${countryCode}${zip}`;

  let beliefs = '';
  for (let i = 0; i < 124; i++) {
    beliefs += beliefCharForLean(lean);
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

const TIMELINE_BUCKETS: { weeksAgo: number; mix: { lean: Lean; w: number }[]; count: number }[] = [
  { weeksAgo: 13, count: 110, mix: [{ lean: 'far_right', w: 85 }, { lean: 'right', w: 13 }, { lean: 'center', w: 2 }] },
  { weeksAgo: 12, count: 110, mix: [{ lean: 'far_right', w: 75 }, { lean: 'right', w: 20 }, { lean: 'center', w: 5 }] },
  { weeksAgo: 11, count: 110, mix: [{ lean: 'far_right', w: 55 }, { lean: 'right', w: 35 }, { lean: 'center', w: 10 }] },
  { weeksAgo: 10, count: 110, mix: [{ lean: 'right', w: 55 }, { lean: 'far_right', w: 25 }, { lean: 'center', w: 20 }] },
  { weeksAgo: 9, count: 110, mix: [{ lean: 'right', w: 50 }, { lean: 'center', w: 30 }, { lean: 'far_right', w: 15 }, { lean: 'left', w: 5 }] },
  { weeksAgo: 8, count: 110, mix: [{ lean: 'center', w: 40 }, { lean: 'right', w: 30 }, { lean: 'left', w: 20 }, { lean: 'far_right', w: 10 }] },
  { weeksAgo: 7, count: 120, mix: [{ lean: 'center', w: 35 }, { lean: 'left', w: 30 }, { lean: 'right', w: 25 }, { lean: 'far_left', w: 5 }, { lean: 'far_right', w: 5 }] },
  { weeksAgo: 6, count: 120, mix: [{ lean: 'left', w: 45 }, { lean: 'center', w: 25 }, { lean: 'far_left', w: 20 }, { lean: 'right', w: 10 }] },
  { weeksAgo: 5, count: 130, mix: [{ lean: 'left', w: 45 }, { lean: 'far_left', w: 30 }, { lean: 'center', w: 20 }, { lean: 'right', w: 5 }] },
  { weeksAgo: 4, count: 130, mix: [{ lean: 'left', w: 40 }, { lean: 'far_left', w: 40 }, { lean: 'center', w: 15 }, { lean: 'right', w: 5 }] },
  { weeksAgo: 3, count: 140, mix: [{ lean: 'far_left', w: 50 }, { lean: 'left', w: 35 }, { lean: 'center', w: 13 }, { lean: 'right', w: 2 }] },
  { weeksAgo: 2, count: 140, mix: [{ lean: 'far_left', w: 60 }, { lean: 'left', w: 30 }, { lean: 'center', w: 10 }] },
  { weeksAgo: 1, count: 150, mix: [{ lean: 'far_left', w: 75 }, { lean: 'left', w: 20 }, { lean: 'center', w: 5 }] },
  { weeksAgo: 0, count: 150, mix: [{ lean: 'far_left', w: 85 }, { lean: 'left', w: 13 }, { lean: 'center', w: 2 }] },
];

function pickCountryForLean(targetLean: Lean) {
  const matches = COUNTRY_PROFILES.filter(c => c.lean === targetLean);
  const adjacent: Record<Lean, Lean[]> = {
    far_left: ['far_left', 'left'],
    left: ['left', 'far_left', 'center'],
    center: ['center', 'left', 'right'],
    right: ['right', 'far_right', 'center'],
    far_right: ['far_right', 'right'],
  };
  const pool = matches.length >= 2
    ? matches
    : COUNTRY_PROFILES.filter(c => adjacent[targetLean].includes(c.lean));
  return pick(pool);
}

async function main() {
  console.log('[seed] Wiping previous test submissions...');
  const wiped = await db.delete(genomeSubmissions).where(eq(genomeSubmissions.isTestData, true));
  console.log('[seed] Wipe complete.');

  const totalPlanned = TIMELINE_BUCKETS.reduce((s, b) => s + b.count, 0);
  console.log(`[seed] Generating ${totalPlanned} submissions across ${TIMELINE_BUCKETS.length} weekly buckets with directional drift...`);

  const rows: any[] = [];
  const now = Date.now();
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

  for (const bucket of TIMELINE_BUCKETS) {
    for (let i = 0; i < bucket.count; i++) {
      const lean = pickWeighted(bucket.mix.map(m => ({ item: m.lean, w: m.w })));
      const country = pickCountryForLean(lean);
      const zip = pick(country.zips);
      const gender = pickWeighted(GENDERS.map(g => ({ item: g, w: g.weight })));
      const birthYear = randInt(1945, 2005);
      const birthMonth = randInt(1, 12);
      const birthDay = randInt(1, 28);

      const dna = buildDna({
        lean,
        birthYear,
        birthMonth,
        birthDay,
        genderCode: gender.code,
        countryCode: country.code,
        zip,
      });
      const parsed = parseDna(dna);
      const anonymousKey = crypto.randomBytes(32).toString('hex');

      const bucketStart = now - bucket.weeksAgo * WEEK_MS;
      const jitter = Math.floor(Math.random() * WEEK_MS);
      const submittedAt = new Date(bucketStart - jitter);

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
  console.log(`[seed] Done. Inserted ${rows.length} test submissions with directional drift over 14 weeks.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
