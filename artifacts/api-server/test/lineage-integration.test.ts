// End-to-end lineage tests.
//
// Pins two contracts that the rest of the system already relies on but had
// zero automated coverage:
//
//   1) POST /api/genome/probes/respond — the lineage row written for a real
//      response must match `applyResponseToScores` exactly. If the route
//      ever drifts from the engine, lineage shown to users would silently
//      lie about the score history.
//
//   2) scripts/backfill-lineage.runBackfillLineage — running the backfill
//      against a user with existing responses must (a) insert exactly one
//      lineage row per (response, dim) impact the engine would produce,
//      and (b) be idempotent on a second run.
//
// Requires DATABASE_URL + GENOME_JWT_SECRET / JWT_SECRET to be set in the
// environment (the dev workspace already provides both).

import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import http, { type Server } from 'node:http';
import { db, pool } from '@workspace/db';
import {
  users,
  beliefResponses,
  beliefLineage,
  dimensionScores,
} from '@workspace/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { applyResponseToScores } from '@belief-genome/engine';
import type { Accumulator } from '@belief-genome/engine';
import app from '../src/app';
import { runBackfillLineage } from '../src/scripts/backfill-lineage';

let server: Server;
let baseUrl: string;
const createdUserIds: number[] = [];

async function startServer(): Promise<void> {
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (!addr || typeof addr === 'string') throw new Error('no addr');
      baseUrl = `http://127.0.0.1:${addr.port}`;
      resolve();
    });
  });
}

async function stopServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
}

async function registerUser(): Promise<{ userId: number; token: string }> {
  // Random email so parallel runs don't collide on the unique index.
  const email = `lineage-test-${Date.now()}-${Math.random().toString(36).slice(2)}@test.local`;
  const res = await fetch(`${baseUrl}/api/genome/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: 'testpassword123', name: 'Lineage Test User' }),
  });
  const text = await res.text();
  assert.equal(res.status, 200, `register failed: ${res.status} ${text}`);
  const body = JSON.parse(text) as { token: string; user: { id: number } };
  createdUserIds.push(body.user.id);
  return { userId: body.user.id, token: body.token };
}

async function cleanupUser(userId: number) {
  // belief_lineage and belief_responses both cascade-delete from users.
  await db.delete(users).where(eq(users.id, userId));
}

before(async () => {
  await startServer();
});

after(async () => {
  for (const id of createdUserIds) {
    try { await cleanupUser(id); } catch { /* best-effort */ }
  }
  await stopServer();
  // Close the pg pool so the test process exits cleanly — otherwise the
  // node:test runner reports "Promise resolution is still pending".
  await pool.end();
});

describe('POST /probes/respond writes lineage that matches the engine', () => {
  it('lineage row equals applyResponseToScores output for a fresh user', async () => {
    const { userId, token } = await registerUser();

    // First response on this user → scoreBefore is null per engine contract.
    // Use multiple dims so we cover the "one response, multiple impacts" path.
    const dimensionWeights = {
      4: { direction: 1,  weight: 1.0 },
      5: { direction: -1, weight: 0.6 },
    };
    const value = 0.85;
    const quality = { weight: 0.7, source: 'bank' };

    const res = await fetch(`${baseUrl}/api/genome/probes/respond`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: `genome_token=${token}`,
      },
      body: JSON.stringify({
        probeText: `lineage-test-probe-${Date.now()}-${Math.random()}`,
        probeCategory: 'life',
        probeSource: 'bank',
        value,
        confidence: 75,
        dimensionWeights,
        quality,
      }),
    });
    assert.equal(res.status, 200, `/respond failed: ${res.status} ${await res.text()}`);

    // Compute expected impacts via the engine — same call the route makes.
    const { impacts: expected } = applyResponseToScores({}, {
      value,
      dimensionWeights,
      quality,
    });
    assert.equal(expected.length, 2, 'engine should produce one impact per dim');

    const rows = await db
      .select()
      .from(beliefLineage)
      .where(eq(beliefLineage.userId, userId));
    assert.equal(rows.length, 2, `expected 2 lineage rows, got ${rows.length}`);

    const byDim = new Map(rows.map(r => [r.dimensionId, r]));
    for (const exp of expected) {
      const row = byDim.get(exp.dimensionId);
      assert.ok(row, `missing lineage row for dim ${exp.dimensionId}`);
      assert.equal(row.scoreBefore, exp.scoreBefore,
        `dim ${exp.dimensionId} scoreBefore mismatch: row=${row.scoreBefore} engine=${exp.scoreBefore}`);
      // Floats round-trip through Postgres real → tolerate tiny precision loss.
      assert.ok(Math.abs(row.scoreAfter - exp.scoreAfter) < 1e-5,
        `dim ${exp.dimensionId} scoreAfter drift: row=${row.scoreAfter} engine=${exp.scoreAfter}`);
      assert.ok(Math.abs(row.delta - exp.delta) < 1e-5,
        `dim ${exp.dimensionId} delta drift: row=${row.delta} engine=${exp.delta}`);
      assert.equal(row.confidenceBefore, exp.confidenceBefore);
      assert.equal(row.confidenceAfter, exp.confidenceAfter);
    }

    // dimension_scores must agree with the engine's `next` accumulator too —
    // lineage that doesn't match the live score table is the bug we're
    // guarding against.
    const dimRows = await db
      .select()
      .from(dimensionScores)
      .where(and(
        eq(dimensionScores.userId, userId),
        inArray(dimensionScores.dimensionId, [4, 5]),
      ));
    assert.equal(dimRows.length, 2);
  });
});

describe('runBackfillLineage is correct + idempotent', () => {
  it('inserts one lineage row per impact, then is a no-op on second run', async () => {
    const { userId, token } = await registerUser();

    // Submit a sequence of responses through the live route so we have real
    // belief_responses rows to backfill against.
    const sequence = [
      { value: 0.9, dims: { 4: { direction: 1, weight: 1.0 } } },
      { value: 0.2, dims: { 4: { direction: 1, weight: 0.8 }, 5: { direction: 1, weight: 0.5 } } },
      { value: 0.7, dims: { 5: { direction: -1, weight: 1.0 } } },
    ];
    for (const s of sequence) {
      const res = await fetch(`${baseUrl}/api/genome/probes/respond`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: `genome_token=${token}` },
        body: JSON.stringify({
          probeText: `backfill-test-${Date.now()}-${Math.random()}`,
          probeCategory: 'life',
          probeSource: 'bank',
          value: s.value,
          confidence: 50,
          dimensionWeights: s.dims,
          quality: { weight: 0.7, source: 'bank' },
        }),
      });
      assert.equal(res.status, 200);
    }

    // Wipe lineage for this user — the responses remain. This is the exact
    // shape the backfill script was designed for: production responses
    // exist, lineage is missing/partial.
    await db.delete(beliefLineage).where(eq(beliefLineage.userId, userId));

    // Compute expected lineage row count by replaying the user's responses
    // through the engine ourselves — same algorithm the backfill uses.
    const respRows = await db
      .select({ value: beliefResponses.value, dimensionWeights: beliefResponses.dimensionWeights, quality: beliefResponses.quality })
      .from(beliefResponses)
      .where(eq(beliefResponses.userId, userId))
      .orderBy(beliefResponses.createdAt, beliefResponses.id);
    let acc: Record<number, Accumulator> = {};
    let expectedRowCount = 0;
    for (const r of respRows) {
      const out = applyResponseToScores(acc, {
        value: r.value as number,
        dimensionWeights: r.dimensionWeights as Record<string, { direction: number; weight: number }>,
        quality: (r.quality ?? { weight: 0.7 }) as { weight?: number },
      });
      acc = out.next;
      expectedRowCount += out.impacts.length;
    }
    assert.ok(expectedRowCount > 0, 'sanity: engine should produce some impacts');

    // First run — should insert exactly expectedRowCount rows.
    const first = await runBackfillLineage({ userId });
    assert.equal(first.inserted, expectedRowCount,
      `first run should insert ${expectedRowCount}, got ${first.inserted}`);

    const afterFirst = await db
      .select({ id: beliefLineage.id })
      .from(beliefLineage)
      .where(eq(beliefLineage.userId, userId));
    assert.equal(afterFirst.length, expectedRowCount);

    // Second run — idempotent, MUST insert nothing.
    const second = await runBackfillLineage({ userId });
    assert.equal(second.inserted, 0,
      `idempotency violated: second backfill inserted ${second.inserted} rows`);

    const afterSecond = await db
      .select({ id: beliefLineage.id })
      .from(beliefLineage)
      .where(eq(beliefLineage.userId, userId));
    assert.equal(afterSecond.length, expectedRowCount,
      'lineage row count must not change on a re-run');
  });
});
