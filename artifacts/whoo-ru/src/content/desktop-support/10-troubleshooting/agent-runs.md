# Troubleshooting agent runs

When a workflow doesn't behave as expected, the **History** panel in
the agent's builder is your first stop — every run logs what
happened. This page indexes the most common failure modes.

## "Run Now" does nothing

- The agent doesn't have any steps. Open the builder and add at
  least one.
- The trigger is something other than Manual *and* "Active" is off.
  Manual runs always work; non-manual runs only fire when Active.
- A previous run is still in flight and the agent has "Allow
  concurrent runs" disabled. Wait, or open Trigger config and
  enable concurrent runs.

## A step shows red ⚠️ in the builder

Hover the icon — the tooltip explains what's missing. Almost
always one of:
- A required input field is empty
- A referenced variable (`{{step1.output.foo}}`) doesn't exist —
  either step1 isn't there yet or its output schema doesn't include
  `foo`
- A referenced API key isn't configured (e.g. step uses Claude but
  no Claude key in Settings)
- A referenced integration isn't connected (e.g. step uses Gmail but
  no Gmail account)

Fix the underlying issue, the icon clears.

## Step throws "Invalid auth"

For an AI step: check the API key in Settings. Even one stray
whitespace character in the key field will fail the request.

For an integration step (Gmail, Calendar, Drive): see
[Reconnecting Gmail](reconnect-gmail.md) — same diagnosis applies
to all OAuth-backed integrations.

## Step throws "Rate limit"

The provider rate-limited you. The runner auto-retries with
exponential backoff (1s, 4s, 16s); if all 3 retries also rate-limit,
the run fails. Solutions:

- Wait a few minutes and Run Now again
- Switch the step to a different model (Sonnet 4 → Sonnet 4.5
  often has different rate-limit pools)
- Reduce frequency for scheduled agents — daily 8 AM instead of
  every 5 min

## Step output is empty / wrong

For AI steps:
- The prompt may be ambiguous. Open the run trace, see exactly
  what input the model received (variables already substituted),
  and adjust.
- The model may not be following instructions. Try a different
  model temporarily (Claude Opus often handles complex multi-step
  reasoning better than Sonnet).
- Add explicit output schema if the next step parses structured
  data — the schema constrains the model's response and prevents
  freeform text.

For integration steps (Gmail, Sheets, etc.):
- Confirm the integration's underlying account has access to
  what you're asking for. (e.g. searching a label that doesn't
  exist returns empty.)

## "Missing API key for X"

- Open Settings → AI API Keys
- Find the provider X (Claude / OpenAI / Gemini / ElevenLabs)
- Paste a valid key
- Save
- Re-run; no app restart needed

## Background workflow not firing

See [Background workflows → Verifying](../03-ai-agents/background-workflows.md#verifying-a-background-workflow).
The fastest check on macOS:

```sh
launchctl list | grep beliefgenome
```

If your agent's plist is loaded but never fires, check the agent's
History after the next scheduled tick — the worker logs to the
same history file the foreground app reads.

## Schedule fired but no run logged

Open the agent's History panel. Scheduled ticks **always** log,
including:

- "Skipped: Active=off" — the toggle was off
- "Skipped: missing API key" — keys aren't configured
- "Skipped: previous run still in progress"
- "Failed: <error>" — actually fired but errored

If you see no log at all for a tick that should have happened,
the scheduler itself didn't fire. Check:

- Was the app running at the scheduled time? (Foreground only —
  background needs the toggle on.)
- Is the cron expression valid? (Use the friendly editor or
  paste into [crontab.guru](https://crontab.guru) to verify.)
- Is your OS time correct? (Daylight Saving boundaries can
  occasionally cause one missed tick.)

## "OpenAI Whisper says file too big"

The Transcribe Audio File template uses Whisper, which has a
**25 MB limit per file**. For longer / larger audio:

- Compress to AAC at 64 kbps (a 1-hour podcast at 64 kbps ≈
  29 MB; aim for 60 kbps to stay under)
- Split the audio into chunks first using a separate workflow

We're considering bundling automatic chunking; for now it's
manual.

## Test Run shows different results than Run Now

Test Run **dry-runs side effects** — `email.send`, `file.write`,
`sheets.write` all log `[DRY-RUN]` instead of executing. Read
steps still execute normally because they have no side effect.

So if a test run shows clean output but the real run fails on a
write step, the failure is in the dry-runnable parts of the
workflow that you haven't actually tested yet. Workaround: build
side-effecting workflows in two halves — read/transform, then
write — and test the read/transform half independently.

## Exporting a failed run for support

In the History panel, click any failed run → **Export → Save to
file**. This produces a JSON file with the full trace including
inputs, outputs, errors, and timing. Attach to a support email
for fastest diagnosis.

The export auto-redacts API keys, OAuth tokens, and known
sensitive header names.
