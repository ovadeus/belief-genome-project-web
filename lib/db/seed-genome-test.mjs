import crypto from 'crypto';
import pg from 'pg';

const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL });

const COUNTRY_WEIGHTS = [
  ['840', 40, ['10001','30301','60601','75201','90210','33101','48201','77001','85001','97201','02101','19101','43201','55401','80201']],
  ['826', 10, ['SW1A1','EC1A1','M11AE','B11BB','LS11A']],
  ['124', 8, ['K1A0B','M5V3L','V6B5K','T2P3C','H3B1A']],
  ['036', 6, ['20000','30000','40000','50000','60000']],
  ['276', 5, ['10115','20095','80331','50667','60311']],
  ['250', 4, ['75001','13001','69001','33000','31000']],
  ['356', 4, ['11001','40001','50001','60001','70001']],
  ['076', 4, ['01000','20000','30000','40000','50000']],
  ['392', 3, ['10000','53000','60000','81000','98000']],
  ['410', 3, ['03000','06000','10000','41000','61000']],
  ['484', 3, ['06600','01000','03100','44100','64000']],
  ['380', 2, ['00100','20100','50100','80100','10100']],
  ['724', 2, ['28001','08001','41001','46001','48001']],
  ['528', 2, ['10000','30000','50000','60000','70000']],
  ['752', 2, ['11120','21100','41100','50100','60100']],
  ['616', 1, ['00001','30001','50001','60001','80001']],
  ['710', 1, ['00010','20000','40000','60000','80000']],
];

const GENDER_WEIGHTS = [['1', 42], ['0', 42], ['9', 8], ['5', 6], ['2', 2]];

const GEN_WEIGHTS = [
  [1940, 1945, 3],
  [1946, 1964, 12],
  [1965, 1980, 22],
  [1981, 1996, 35],
  [1997, 2006, 23],
  [2007, 2010, 5],
];

function weightedPick(items) {
  const total = items.reduce((s, i) => s + i[1], 0);
  let r = Math.random() * total;
  for (const [item, weight] of items) { r -= weight; if (r <= 0) return item; }
  return items[items.length - 1][0];
}

function weightedPickCountry() {
  const total = COUNTRY_WEIGHTS.reduce((s, i) => s + i[1], 0);
  let r = Math.random() * total;
  for (const [code, weight, zips] of COUNTRY_WEIGHTS) {
    r -= weight; if (r <= 0) return { code, zip: zips[Math.floor(Math.random() * zips.length)] };
  }
  const last = COUNTRY_WEIGHTS[COUNTRY_WEIGHTS.length - 1];
  return { code: last[0], zip: last[2][0] };
}

function pickBirthYear() {
  const gen = weightedPick(GEN_WEIGHTS.map(([s, e, w]) => [[s, e], w]));
  return gen[0] + Math.floor(Math.random() * (gen[1] - gen[0] + 1));
}

function generateBeliefProfile() {
  const archetypes = [
    { center: 5, spread: 2.5, explored: 0.85 },
    { center: 3, spread: 2, explored: 0.7 },
    { center: 7, spread: 2, explored: 0.75 },
    { center: 4, spread: 3, explored: 0.6 },
    { center: 6, spread: 2, explored: 0.9 },
    { center: 5, spread: 1.5, explored: 0.95 },
    { center: 2, spread: 2, explored: 0.5 },
    { center: 8, spread: 1.5, explored: 0.65 },
  ];
  const arch = archetypes[Math.floor(Math.random() * archetypes.length)];
  let beliefs = '';
  for (let i = 0; i < 124; i++) {
    if (Math.random() > arch.explored) { beliefs += '.'; }
    else {
      let val = Math.round(arch.center + (Math.random() - 0.5) * 2 * arch.spread);
      val = Math.max(0, Math.min(9, val));
      beliefs += val.toString();
    }
  }
  return beliefs;
}

const genderMap = { '0': 'F', '1': 'M', '2': 'Intersex', '5': 'PNS', '9': 'NB' };

async function seed() {
  await client.connect();

  await client.query(`DELETE FROM genome_submissions WHERE is_test_data = true`);
  console.log('Cleared old test data.');

  const COUNT = 350;
  console.log(`Generating ${COUNT} test genome submissions...`);

  const insertSQL = `INSERT INTO genome_submissions 
    (anonymous_key, dna_string, demographic_prefix, century, birth_year, birth_month, birth_day, 
     gender, country_code, zip_code, belief_values, dimensions_explored, is_test_data, submitted_at, updated_at) 
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`;

  for (let i = 0; i < COUNT; i++) {
    const birthYear = pickBirthYear();
    const genderCode = weightedPick(GENDER_WEIGHTS);
    const { code: countryCode, zip } = weightedPickCountry();
    const beliefs = generateBeliefProfile();

    const century = birthYear >= 2000 ? 1 : 0;
    const yy = (birthYear % 100).toString().padStart(2, '0');
    const month = (Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0');
    const day = (Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0');
    const paddedZip = zip.padEnd(5, '0').slice(0, 5);
    const dnaString = `${century}${yy}${month}${day}${genderCode}${countryCode}${paddedZip}${beliefs}`;
    const anonymousKey = crypto.randomBytes(32).toString('hex');

    const beliefValues = {};
    let dimensionsExplored = 0;
    for (let j = 0; j < 124; j++) {
      const char = beliefs[j];
      const dimId = j + 4;
      if (char === '.') { beliefValues[String(dimId)] = null; }
      else { beliefValues[String(dimId)] = parseInt(char); dimensionsExplored++; }
    }

    const submittedAt = new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000));
    const gender = genderMap[genderCode] || 'PNS';
    const demoPrefix = `${century} century · ${yy} year · ${month} month · ${day} day · ${genderCode} gender · ${countryCode} country · ${paddedZip} zip`;

    await client.query(insertSQL, [
      anonymousKey, dnaString, demoPrefix, century, birthYear, parseInt(month), parseInt(day),
      gender, countryCode, paddedZip, JSON.stringify(beliefValues), dimensionsExplored, true,
      submittedAt, submittedAt
    ]);

    if ((i + 1) % 50 === 0) console.log(`  Inserted ${i + 1} / ${COUNT}`);
  }

  console.log(`Done! ${COUNT} test submissions seeded.`);
  await client.end();
}

seed().catch(err => { console.error('Seed error:', err); process.exit(1); });
