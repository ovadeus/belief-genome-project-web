# Run history

Every workflow run — successful, failed, skipped, dry-run — is logged.
The **History** panel surfaces the full record.

## Opening run history

Inside the builder for any agent, click **History** in the top action
bar. A modal opens showing every run for this agent, newest first.

## What's logged

Per run:

- **When** — local timestamp
- **Trigger** — manual / schedule / event / chained
- **Mode** — `[live]` or `[dry-run]` or `[background]`
- **Duration** — total wall-clock time
- **Status** — success / partial / failed / skipped
- **Step-by-step trace** — every step's input, output, and timing,
  collapsible

Click any run to expand its full step trace. Each step shows:
- The resolved input (after variable substitution)
- The raw output
- API cost estimate (for AI steps — only if the provider returns
  token usage in the response)
- Errors / warnings / retries

## Clearing history

The **Clear** button (top-right of the History modal) wipes all run
records for this agent only. Other agents are unaffected. There's no
undo. The action is logged separately to the activity feed for
auditing.

## Why a run was "skipped"

The most common reasons:

- **Active=off** — the agent's main toggle is off but the schedule
  ticked anyway (the scheduler still notes it)
- **Missing API key** — Claude/OpenAI/etc. key not set; the agent
  needs one and has none
- **Missing integration** — agent uses Gmail but no Gmail account is
  connected
- **Concurrent run** — a previous run of the same agent is still in
  progress; the scheduler skips overlapping runs (configurable per
  agent — see Trigger config → "Allow concurrent runs")
- **Filter didn't match** — for event triggers, the event fired but
  the agent's filter rejected it (not really a skip — just isn't
  logged at all unless you turn on "Log filtered events" in
  developer settings)

## Why a run "failed" vs "partial"

- **Failed** — the first step couldn't complete; nothing meaningful
  happened
- **Partial** — at least one step succeeded but a later step
  errored; the agent stopped, so any unfinished side effects didn't
  occur

Both are recoverable. Click into the failed step to see the error
message; common ones are network timeouts, rate-limit responses
from API providers, or schema mismatches in step inputs.

## Retries

If a step fails with a retryable error (HTTP 429, 502, 503, network
timeout), the runner retries up to 3 times with exponential backoff
(1s, 4s, 16s). The trace shows each retry attempt as a sub-row.

Non-retryable errors (4xx other than 429, schema validation, missing
auth) fail immediately.

## Exporting a run

Click any run row → **Export** menu → **Copy as JSON** or **Save to
file**. Useful for debugging — you can paste a failed run's trace
into a support email and we can see exactly what each step received
and emitted.

## How long is history kept?

Indefinitely, until you clear it. History is local-only and takes
~2 KB per run on average. Even an aggressive every-5-minute agent
running for a year produces ~200 MB of history; if that becomes a
concern, **Settings → Workflows → Auto-prune history older than:**
sets a retention window (default: never).

## See also

- [The workflow builder](builder.md)
- [Scheduling & triggers](scheduling.md)
- [Troubleshooting agent runs](../10-troubleshooting/agent-runs.md)
