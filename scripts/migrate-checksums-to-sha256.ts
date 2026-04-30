/**
 * One-time migration: re-stamp existing FNV-1a checksums on stored
 * DNA signatures with SHA-256 so they validate under the new (V2.1)
 * codec. The signature payload is unchanged — only the trailing 4-char
 * checksum after the final `-` is recomputed.
 *
 * Touches three columns:
 *   - known_dnas.signature
 *   - dna_share_events.signature
 *   - dna_share_events.signature_b   (side B of compare_view rows)
 *
 * Usage:
 *   pnpm --filter @workspace/scripts run migrate:checksums:dry   # count only
 *   pnpm --filter @workspace/scripts run migrate:checksums       # writes
 *
 * The checksum function is imported directly from the live engine, so
 * there's exactly ONE source of truth — if the algorithm ever changes
 * again, this script automatically tracks it.
 */
import { db, knownDnas, dnaShareEvents, pool } from '@workspace/db';
import { checksum } from '@belief-genome/engine';
import { eq } from 'drizzle-orm';

const SIG_RE = /^([as]):(.+)-([a-z0-9]{4})$/i;

async function rechecksum(signature: string): Promise<string | null> {
  const m = signature.match(SIG_RE);
  if (!m) return null;
  const [, prefix, payload] = m;
  const newCk = await checksum(payload);
  return `${prefix}:${payload}-${newCk}`;
}

type CountBucket = { updated: number; unchanged: number; skipped: number };

function blank(): CountBucket {
  return { updated: 0, unchanged: 0, skipped: 0 };
}

async function planRow(
  current: string | null,
): Promise<{ next: string | null; classification: 'updated' | 'unchanged' | 'skipped' | 'null' }> {
  if (current == null) return { next: null, classification: 'null' };
  const next = await rechecksum(current);
  if (next === null) return { next: null, classification: 'skipped' };
  if (next === current) return { next, classification: 'unchanged' };
  return { next, classification: 'updated' };
}

async function migrateKnownDnas(dryRun: boolean): Promise<CountBucket> {
  const bucket = blank();
  const rows = await db.select({ id: knownDnas.id, signature: knownDnas.signature }).from(knownDnas);
  for (const row of rows) {
    const { next, classification } = await planRow(row.signature);
    if (classification === 'skipped') {
      bucket.skipped++;
      continue;
    }
    if (classification === 'unchanged') {
      bucket.unchanged++;
      continue;
    }
    if (classification === 'updated' && next) {
      if (!dryRun) {
        await db.update(knownDnas).set({ signature: next }).where(eq(knownDnas.id, row.id));
      }
      bucket.updated++;
    }
  }
  return bucket;
}

async function migrateDnaShareEvents(dryRun: boolean): Promise<CountBucket> {
  const bucket = blank();
  const rows = await db
    .select({
      id: dnaShareEvents.id,
      signature: dnaShareEvents.signature,
      signatureB: dnaShareEvents.signatureB,
    })
    .from(dnaShareEvents);

  for (const row of rows) {
    const a = await planRow(row.signature);
    const b = await planRow(row.signatureB);

    const patch: { signature?: string; signatureB?: string } = {};
    let touched = false;

    if (a.classification === 'updated' && a.next) {
      patch.signature = a.next;
      touched = true;
    } else if (a.classification === 'skipped') {
      bucket.skipped++;
    }

    if (b.classification === 'updated' && b.next) {
      patch.signatureB = b.next;
      touched = true;
    } else if (b.classification === 'skipped') {
      bucket.skipped++;
    }

    if (touched) {
      if (!dryRun) {
        await db.update(dnaShareEvents).set(patch).where(eq(dnaShareEvents.id, row.id));
      }
      bucket.updated++;
    } else if (a.classification === 'unchanged' || b.classification === 'unchanged') {
      bucket.unchanged++;
    }
  }
  return bucket;
}

function fmt(label: string, b: CountBucket) {
  console.log(
    `  ${label.padEnd(22)} updated=${b.updated}  unchanged=${b.unchanged}  skipped=${b.skipped}`,
  );
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  console.log(dryRun ? '=== DRY RUN — no writes ===' : '=== LIVE RUN — writes will commit ===');
  console.log('');

  const k = await migrateKnownDnas(dryRun);
  const d = await migrateDnaShareEvents(dryRun);

  console.log('Results:');
  fmt('known_dnas',        k);
  fmt('dna_share_events',  d);
  console.log('');
  console.log(`Total rows touched: ${k.updated + d.updated}`);

  if (dryRun) {
    console.log('\nNothing was written. Re-run without --dry-run to commit.');
  } else {
    console.log('\nMigration complete. Verify a few rows: signature payload should be unchanged, only the last 4 chars (after the final `-`) updated.');
  }

  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  try { await pool.end(); } catch {}
  process.exit(1);
});
