#!/bin/bash
# Post-merge setup for the Belief Genome pnpm monorepo.
#
# Runs automatically after every task merge. Keep it FAST and IDEMPOTENT —
# stdin is closed, so any prompt would hang/fail.
#
# What we do:
#   1. pnpm install (frozen lockfile when possible) — picks up new deps
#      added by merged tasks.
#
# What we deliberately DO NOT do:
#   - `drizzle-kit push` / `db push` — replit.md is explicit: this would
#     drop the orphan eh_* tables. Schema migrations are run by hand via
#     dedicated raw `ALTER TABLE ... IF NOT EXISTS` scripts under
#     artifacts/api-server/src/scripts/ (see migrate-frontiers-v2.ts and
#     migrate-add-probe-v2-columns.ts for the pattern).
#   - Tests — too slow for the post-merge window; CI handles them.
#   - Builds — Vite/tsx run from source in dev; deployment builds prod.

set -euo pipefail

echo "[post-merge] pnpm install"
# --prefer-offline keeps a warm-cache run inside the post-merge timeout.
# --frozen-lockfile=false because a merged task may have updated the lock.
pnpm install --prefer-offline --frozen-lockfile=false

echo "[post-merge] done"
