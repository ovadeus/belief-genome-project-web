# Scheduling & triggers

How and when an agent fires depends on its **trigger**. Three families:
**Manual**, **Schedule**, and **Event**. Each has its own rules.

## Manual

The agent only runs when you click **Run Now** in the builder, or
when another agent invokes it.

- **Active** toggle is irrelevant for manual triggers — Run Now
  always works.
- Manual agents can declare **input fields** that you fill in at run
  time (e.g. a YouTube URL).
- You can chain manual agents: a step in agent A can call agent B and
  pass its output forward.

## Schedule (cron)

Cron-style recurring runs. Configured via a friendly editor that
covers the common patterns and exposes a raw cron expression for
power users.

### Friendly presets

- **Every 5 minutes** — `*/5 * * * *`
- **Hourly** — `0 * * * *`
- **Daily at 8 AM** — `0 8 * * *`
- **Weekdays at 8 AM** — `0 8 * * 1-5`
- **Weekly on Monday at 9 AM** — `0 9 * * 1`
- **First of every month** — `0 0 1 * *`

### Custom cron

Enter any standard 5-field cron expression. Time zone is your
local time as the OS reports it.

### When schedules fire

- Only when **Active** is toggled on
- Only when the desktop is running, *unless* **Background** is also
  on (see [Background workflows](background-workflows.md))
- The scheduler checks every 60 seconds — your "every 5 min" agent
  will fire within ~60s of the schedule's tick

### Catching up after the app restarts

When the desktop launches, the scheduler computes "would this agent
have fired since I was last running?" and:

- For agents marked **Run on startup if missed**: yes, fire once
  immediately for the most-recently-missed slot
- Otherwise: skip missed slots; resume on the next future tick

Toggle "Run on startup if missed" in each agent's trigger config.

## Event

Fires when something specific happens in the desktop or a connected
service.

| Event ID | Fires when |
|---|---|
| `email:new` | Any connected mailbox receives a new message matching the agent's filter (sender, subject, label, etc.) |
| `email:label-added` | A specific label is applied to a thread |
| `file:changed` | A file in a watched folder is created or modified |
| `file:added` | A new file lands in a watched folder |
| `probe:answered` | You submit a belief probe |
| `probe:dimension-completed` | An exploration session finishes a dimension |
| `agent:finished` | Another agent completed (chain) |
| `agent:failed` | Another agent errored |
| `time:morning` | Soft daily hook (~7 AM local) |
| `time:evening` | Soft daily hook (~6 PM local) |
| `dna:weekly-shift` | DNA centroid moved >5% since last week |
| `app:launch` | The desktop starts up |

Event triggers are configured with a **filter** — e.g. for
`email:new` you can specify "from contains 'invoice'" so the agent
fires only on matching messages, not every email.

### Event throttling

Several events are noisy by default. The scheduler throttles:

- `email:new` — 1 fire per agent per minute max
- `file:changed` — 1 fire per file per 30 s (debounced)
- `probe:answered` — no throttle (low volume by nature)

You can override per-agent in advanced trigger settings.

## Combining triggers

Currently each agent has one trigger. To run an agent on a schedule
**and** on an event, create a second agent with the other trigger
that calls the first one as its only step (a single **Multi: Run
Agent** step pointing at agent A). Both wrappers will then fire
agent A on their respective triggers.

We're considering native multi-trigger support in a future release —
let us know in feedback if you want it.

## Verifying a schedule is firing

The **History** panel shows every run, including skipped ones with
a reason ("Skipped: Active=off," "Skipped: missing API key," etc.).
If you expected a run that didn't appear, check History first; it
usually tells you why.

## Time zone

The desktop uses your OS time zone for cron evaluation. If you
travel and your laptop adjusts to a new TZ, your schedules
automatically follow. To pin a schedule to a specific TZ regardless
of OS, use the advanced cron editor and add a `TZ=America/New_York`
prefix.
