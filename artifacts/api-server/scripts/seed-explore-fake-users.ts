import { db } from '@workspace/db';
import { genomeSubmissions } from '@workspace/db/schema';
import crypto from 'crypto';

type Archetype =
  | 'strong_progressive'
  | 'strong_conservative'
  | 'moderate_progressive'
  | 'moderate_conservative'
  | 'heterodox_left'
  | 'heterodox_right';

const COUNTRIES: { code: string; zips: string[] }[] = [
  { code: '840', zips: ['10001', '94110', '60601', '02139', '78701'] },
  { code: '826', zips: ['SW1A1', 'EC1A1', 'M11AE', 'B11AA', 'LS11UR'] },
  { code: '124', zips: ['M5V3A', 'V6B1A', 'H2X1Y', 'T2P0R', 'K1A0A'] },
  { code: '036', zips: ['20001', '30001', '40001', '50001', '60001'] },
  { code: '276', zips: ['10115', '80331', '20095', '50667', '60311'] },
  { code: '250', zips: ['75001', '69001', '13001', '31000', '44000'] },
  { code: '392', zips: ['10000', '15000', '53000', '60001', '81001'] },
  { code: '076', zips: ['01310', '20040', '30130', '40010', '50030'] },
  { code: '356', zips: ['11000', '40000', '60000', '70000', '80000'] },
  { code: '484', zips: ['01000', '03000', '06000', '44100', '64000'] },
  { code: '752', zips: ['11122', '21111', '40010', '50212', '90325'] },
  { code: '528', zips: ['10120', '30115', '50111', '70111', '90120'] },
];

const GENDERS: { code: string; label: string }[] = [
  { code: '0', label: 'F' },
  { code: '1', label: 'M' },
  { code: '9', label: 'NB' },
  { code: '5', label: 'PNS' },
  { code: '2', label: 'Intersex' },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickWeighted<T>(items: { item: T; w: number }[]): T {
  const total = items.reduce((s, i) => s + i.w, 0);
  let r = Math.random() * total;
  for (const i of items) {
    r -= i.w;
    if (r <= 0) return i.item;
  }
  return items[items.length - 1].item;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateBeliefValue(archetype: Archetype): string {
  switch (archetype) {
    case 'strong_progressive':
      return pickWeighted([
        { item: String(randInt(7, 9)), w: 65 },
        { item: String(randInt(5, 6)), w: 18 },
        { item: String(randInt(0, 2)), w: 6 },
        { item: String(randInt(3, 4)), w: 5 },
        { item: '.', w: 6 },
      ]);
    case 'strong_conservative':
      return pickWeighted([
        { item: String(randInt(0, 2)), w: 65 },
        { item: String(randInt(3, 4)), w: 18 },
        { item: String(randInt(7, 9)), w: 6 },
        { item: String(randInt(5, 6)), w: 5 },
        { item: '.', w: 6 },
      ]);
    case 'moderate_progressive':
      return pickWeighted([
        { item: String(randInt(5, 7)), w: 55 },
        { item: String(randInt(3, 4)), w: 18 },
        { item: String(randInt(8, 9)), w: 12 },
        { item: String(randInt(0, 2)), w: 8 },
        { item: '.', w: 7 },
      ]);
    case 'moderate_conservative':
      return pickWeighted([
        { item: String(randInt(2, 4)), w: 55 },
        { item: String(randInt(5, 6)), w: 18 },
        { item: String(randInt(0, 1)), w: 12 },
        { item: String(randInt(7, 9)), w: 8 },
        { item: '.', w: 7 },
      ]);
    case 'heterodox_left':
      return pickWeighted([
        { item: String(randInt(7, 9)), w: 40 },
        { item: String(randInt(0, 2)), w: 35 },
        { item: String(randInt(4, 6)), w: 15 },
        { item: '.', w: 10 },
      ]);
    case 'heterodox_right':
      return pickWeighted([
        { item: String(randInt(0, 2)), w: 40 },
        { item: String(randInt(7, 9)), w: 35 },
        { item: String(randInt(4, 6)), w: 15 },
        { item: '.', w: 10 },
      ]);
  }
}

function buildDnaString(opts: {
  archetype: Archetype;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  genderCode: string;
  countryCode: string;
  zip: string;
}): string {
  const { archetype, birthYear, birthMonth, birthDay, genderCode, countryCode, zip } = opts;
  const century = birthYear >= 2000 ? '1' : '0';
  const yearInCentury = String(birthYear % 100).padStart(2, '0');
  const month = String(birthMonth).padStart(2, '0');
  const day = String(birthDay).padStart(2, '0');
  const meta = `${century}${yearInCentury}${month}${day}${genderCode}${countryCode}${zip}`;

  let beliefs = '';
  for (let i = 0; i < 124; i++) {
    beliefs += generateBeliefValue(archetype);
  }
  return meta + beliefs;
}

function parseDnaString(dna: string) {
  const century = parseInt(dna[0]) || 0;
  const yearInCentury = parseInt(dna.slice(1, 3)) || 0;
  const birthYear = (century === 0 ? 1900 : 2000) + yearInCentury;
  const birthMonth = parseInt(dna.slice(3, 5)) || 0;
  const birthDay = parseInt(dna.slice(5, 7)) || 0;
  const genderCode = dna[7];
  const genderMap: Record<string, string> = { '0': 'F', '1': 'M', '2': 'Intersex', '5': 'PNS', '9': 'NB' };
  const gender = genderMap[genderCode] || 'PNS';
  const countryCode = dna.slice(8, 11);
  const zipCode = dna.slice(11, 16);

  const beliefValues: Record<string, number | null> = {};
  let dimensionsExplored = 0;
  for (let i = 16; i < 140 && i < dna.length; i++) {
    const ch = dna[i];
    const dimId = i - 16 + 4;
    if (ch === '.') {
      beliefValues[String(dimId)] = null;
    } else {
      const v = parseInt(ch);
      if (!isNaN(v)) {
        beliefValues[String(dimId)] = v;
        dimensionsExplored++;
      } else {
        beliefValues[String(dimId)] = null;
      }
    }
  }
  return { century, birthYear, birthMonth, birthDay, gender, countryCode, zipCode, beliefValues, dimensionsExplored };
}

const ARCHETYPE_PLAN: { archetype: Archetype; count: number }[] = [
  { archetype: 'strong_progressive', count: 14 },
  { archetype: 'strong_conservative', count: 14 },
  { archetype: 'moderate_progressive', count: 9 },
  { archetype: 'moderate_conservative', count: 9 },
  { archetype: 'heterodox_left', count: 7 },
  { archetype: 'heterodox_right', count: 7 },
];

async function main() {
  const totalPlanned = ARCHETYPE_PLAN.reduce((s, p) => s + p.count, 0);
  console.log(`[seed] Generating ${totalPlanned} diverse fake genome submissions...`);

  const rows: any[] = [];
  const now = Date.now();
  const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

  for (const { archetype, count } of ARCHETYPE_PLAN) {
    for (let i = 0; i < count; i++) {
      const country = pick(COUNTRIES);
      const zip = pick(country.zips);
      const gender = pick(GENDERS);
      const birthYear = randInt(1945, 2005);
      const birthMonth = randInt(1, 12);
      const birthDay = randInt(1, 28);

      const dna = buildDnaString({
        archetype,
        birthYear,
        birthMonth,
        birthDay,
        genderCode: gender.code,
        countryCode: country.code,
        zip,
      });
      const parsed = parseDnaString(dna);
      const anonymousKey = crypto.randomBytes(32).toString('hex');
      const submittedAt = new Date(now - Math.floor(Math.random() * NINETY_DAYS_MS));

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

  console.log(`[seed] Inserting ${rows.length} rows into genome_submissions...`);
  await db.insert(genomeSubmissions).values(rows);
  console.log(`[seed] Done. Inserted ${rows.length} test submissions across ${ARCHETYPE_PLAN.length} archetypes.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
