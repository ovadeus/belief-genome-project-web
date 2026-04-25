# Settings reference

A full pass through every section in the Settings window. Open
Settings via the **gear icon** at the bottom-left of the sidebar
(reachable from any page).

## Profile

- **Display name** — what shows up in greetings ("Good morning,
  <name>") and as the author on web-synced reflections
- **Avatar** — optional; click the avatar circle to upload an image
  or capture from camera (requires Camera permission)
- **Time zone** — auto-detected from your OS; override here if you
  want a fixed TZ regardless of OS
- **Default model** — Sonnet / Opus / Haiku for Claude (and
  equivalent for other providers)

## Dashboard

- **Background source** — Unsplash, solid color, custom folder, or
  pinned single image (see [Backgrounds](../02-mission-control/backgrounds.md))
- **Show photo credit** — toggle the "Photo by … on Unsplash"
  attribution
- **Idle fade** — auto-hide widgets after 30 s of no activity
- **Reset dashboard layout** — restore default widget arrangement

## AI API Keys

Per-provider key fields. See
[AI provider keys](../05-integrations/ai-keys.md).

- Claude (Anthropic)
- OpenAI
- Gemini
- ElevenLabs

Each has a small **Test** button next to the field that fires a
single low-cost call to verify the key works. Saved keys show a
green "✓ Saved" badge.

## Email Integration

- **Google OAuth** (Gmail + Calendar) — see
  [Connecting Google](../05-integrations/google.md)
- **Microsoft OAuth** (Outlook + Calendar) — see
  [Connecting Microsoft](../05-integrations/microsoft.md)
- **Connected Accounts** — list of currently-linked accounts with
  per-account status badge and Remove button

Below the list: **+ Connect Gmail** / **+ Connect Outlook** to add
new accounts.

## Belief Genome

- **API base URL** — defaults to `https://beliefgenomeproject.org`;
  override for self-hosted instances
- **Auth token (Bearer)** — paste from your web account's API
  access page
- **Test connection** — verifies the token works
- **Sync now** — pushes any unsynced local responses to the web
  account immediately
- **Last synced** — timestamp of the last successful sync

## Probes

- **Probe source preference** — News / Bank / Mixed (default Mixed)
- **News probe feed URL** — override the default Belief Genome
  curated feed
- **Probe scheduler aggressiveness** — How often to push new probes
  into the bottom bar

## Research

- **Sources** — toggle Web / Reddit / RSS / Hacker News / etc.
- **Topics** — your research topics (a stable list of subject
  areas the Research Pulse agent prioritizes)
- **Refresh interval** — how often to fetch new articles (default
  hourly)

## Workflows

- **Run history retention** — how long to keep run logs (default:
  forever)
- **Disable all background workflows** — emergency-stop for every
  launchd / systemd / Task Scheduler unit
- **Concurrent run limit** — max parallel workflow runs (default 4)

## Display

- **Window opacity** — 100% by default; useful for ambient
  always-on-top setups
- **DNA strip cell size** — small / medium / large
- **UI zoom** — text size scaler (also accessible via the +/− in
  the sidebar footer)

## Privacy & Data

- **Reset onboarding** — replays the welcome flow on next launch;
  doesn't delete anything
- **Sign out of this device** — clears auth token + email; local
  data persists
- **Full reset** — wipes everything. See
  [Full reset](../11-privacy-and-data/reset.md). Has a hard
  type-to-confirm gate.

## Diagnostics

- **API usage summary** — token / cost rollup for last 7/30 days
- **Activity feed** — recent in-app actions (navigations, agent
  runs, etc.)
- **Open data folder** — opens your config / brain-data folder in
  Finder/Explorer
- **Open log file** — opens the Electron main-process log
- **Export support bundle** — zips your config (with secrets
  redacted) and recent logs for a support email

## Keyboard

A live preview of every keyboard shortcut. See
[Keyboard shortcuts](../09-keyboard-shortcuts/) for the full list.

## About

App version, license info, links to the support docs (this set!),
the project repo, and the privacy policy.
