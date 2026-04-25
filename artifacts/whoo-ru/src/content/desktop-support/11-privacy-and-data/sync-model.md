# Sync model — what goes to the web, what stays local

A precise breakdown of which data the desktop sends to Belief Genome's
web servers, what it never sends, and how to control it.

## The three data lanes

### Lane 1 — Local-only (always)

Never leaves your machine. Even when you've connected your web
account, these are not synced:

- AI provider API keys (Claude, OpenAI, Gemini, ElevenLabs)
- Gmail / Outlook OAuth tokens
- Workflow run history (per-step inputs/outputs)
- Generated media files (audio, transcripts)
- Note widget content
- Bookmarks, Tasks, Habits, Countdowns, Launchpad apps, MusicPax
  config, zBinder API key
- Cached background photos

### Lane 2 — Optional sync to web (you control)

Sent to Belief Genome's web account **only** if you've connected and
have explicitly opted in to that data type. Settings → Belief Genome
→ "Sync these data types" lets you toggle each:

- **Belief responses** — every probe you've answered
- **DNA serial** — your computed DNA snapshot, refreshed daily
- **Reflections** — written notes attached to probe answers
- **Memories** — entries from the Memory feature
- **Passions** — declared topics of interest

Enabling sync gives you cross-device access (answer on phone web,
see on desktop) and unlocks features that need server-side history
(Evolution panel, DNA Compare).

The default state of the toggles depends on your onboarding choice:
"Strict local mode" defaults all OFF, "Standard mode" (the default)
defaults Belief responses + DNA serial to ON.

### Lane 3 — Always-synced (when web account is connected)

Data that's part of the account itself, not your DNA:

- Your display name
- Your avatar (if you've uploaded one)
- Your preferred time zone
- Your last-active timestamp
- The fact that this device has signed in (a per-device record so
  you can see "logged in from MacBook Pro · April 25" on the web)

These can't be toggled — they're identity-level. If you don't want
them synced, don't connect your web account.

## What about the AI providers?

When a workflow step calls Claude / OpenAI / etc., the desktop
sends the relevant data **directly to that provider** — not through
Belief Genome's servers. The provider's privacy policy applies to
what they do with it.

You're paying the provider directly with your own key, and the
data flow is exactly the same as if you used their API from a
script you wrote yourself.

## What gets synced TO the desktop FROM the web

Symmetric to the upload lane:

- Belief responses you logged on the web go down to the desktop
  (so the desktop's History panel includes them)
- Your DNA serial as the web computes it (used by the Evolution
  panel's "DNA Snapshot" scrubber)
- Reflections, memories, passions if you have those toggles on
- The probe bank itself (the desktop has a local copy, but pulls
  updates when the web's bank version bumps)

## Sync frequency

- **Active syncs:** every 5 minutes while the app is open and
  has at least one toggle on
- **Push-on-write:** when you submit a probe with sync enabled,
  it pushes within ~10 seconds (without waiting for the next
  poll)
- **On-demand:** Settings → Belief Genome → "Sync now" forces an
  immediate full sync in both directions

## How to see what's synced

`Settings → Diagnostics → "Sync log"` shows the last 50 sync
operations with payload sizes (not contents) and timestamps.
If a sync failed, the error appears here too.

## Disabling sync entirely

Settings → Belief Genome → toggle every sync type OFF. This
doesn't sign you out — your auth token stays valid for things like
the Evolution panel's read-only timeline pull — but no writes go
back up.

To fully disconnect, sign out (Settings → Reset Account → "Sign
out of this device"). After that, no network calls go to Belief
Genome's web servers regardless of toggle state.

## Data residency

Belief Genome's web infrastructure is hosted in the US (AWS
us-east-1 as of v0.1.0). All synced data lands in US datacenters.
If data residency matters for your jurisdiction, run the desktop
disconnected and use the local-only experience.

## Encryption

In transit: HTTPS for everything. The desktop pins the
beliefgenomeproject.org certificate chain.

At rest: web-side, the database is encrypted at the storage layer.
Locally on your machine, the JSON files are not encrypted at the
filesystem level — they rely on macOS / Windows / Linux file
permissions for protection. If your machine is compromised, the
files are readable.

For an extra layer, use FileVault (macOS) / BitLocker (Windows) /
LUKS (Linux) for full-disk encryption. The desktop doesn't add its
own crypto layer because we believe FDE is the right boundary for
this kind of data.

## Sharing with others

The only data that ever leaves your account boundary intentionally
is via the **Compare** feature (DNA Compare with friends). This
sends a privacy-preserving snapshot of your DNA serial to a friend
who has your comparison key. No other data is shared.

There is no "share with employer," "share with researchers," or
"share with the public" lane. Belief Genome's website does have a
public-archetypes corpus (e.g. "Average Stoic" for comparison
purposes) but those are aggregate, anonymized, and you have to
opt-in your data to be included.
