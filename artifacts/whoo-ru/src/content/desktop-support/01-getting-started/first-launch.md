# First launch & onboarding

The first time you open BGP Mission Control, an **Onboarding** flow walks
you through three things: signing into your Belief Genome account, adding
at least one AI provider key, and confirming a few defaults.

This page is a tour of what each step asks for and why.

## Step 1 — Sign in to your Belief Genome account

The desktop is built around the same account you use on
**beliefgenomeproject.org**. Signing in here links the two so your DNA,
reflections, and preferences sync between them.

You'll be asked for:

- **Email address** — the same one you registered with on the web
- **Auth token (Bearer)** — a one-time string you copy from your account
  settings on the web app

To get the token:
1. Open **beliefgenomeproject.org** in your browser
2. Sign in
3. Go to your **Profile** (or **Account** → **API access**, depending on
   your tier)
4. Click **Generate desktop token**
5. Copy the long string that starts with `bgp_…`
6. Paste it into the desktop's onboarding "Auth token" field

Click **Continue**. The desktop verifies the token by making a single
authenticated call to the web API; if it succeeds, your name and email
populate from your web profile.

## Step 2 — Add your AI provider keys

BGP Mission Control orchestrates AI agents using your own API keys, never
ours. You add at least one of:

| Provider | Used by | Where to get a key |
|---|---|---|
| **Claude** (Anthropic) | Most workflow steps, dimension classification | console.anthropic.com → Settings → API Keys |
| **OpenAI** | Whisper audio transcription, GPT steps | platform.openai.com → API keys |
| **Gemini** (Google) | Some workflow steps, alternate model option | aistudio.google.com → Get API key |
| **ElevenLabs** | Text-to-speech ("Text → MP3" agent) | elevenlabs.io → Profile → API key |

You don't need all of them. Claude alone unlocks the majority of
workflows. The connection-status panel at the bottom of the sidebar shows
a green dot for each provider once a non-empty key is saved.

These keys live **only** in your local config file
(`~/Documents/mission-control-config.json` on macOS) — they're never sent
to Belief Genome's servers. See [Privacy & Data](../11-privacy-and-data/).

## Step 3 — Confirm dashboard defaults

The last screen lets you tick:

- **Generate today's reflection now** — runs your first daily reflection
  prompt immediately so the dashboard isn't empty
- **Use Unsplash background images** — ambient backgrounds for the
  Mission Control window (you can disable in Settings later)
- **Run Inbox Summary on launch** — tries to read your Gmail and surface
  important threads (only fires after you connect Gmail in Settings)

Click **Finish** to land on Mission Control.

## Skipping onboarding

There's no skip button — every step except #2 is required because
without an account link the desktop can't sync, and without at least one
AI key no workflow can run. If you absolutely need to defer:
- For #1: paste any 10+ char token. The desktop won't validate until
  it makes its first sync call. Replace it later in
  **Settings → Belief Genome account**.
- For #2: paste any non-empty string into the Claude key field. Replace
  it later in **Settings → AI API Keys**. Without a real key, agent
  runs will fail.

## What if I want to start over?

Open **Settings → Reset Account** → click **Reset Onboarding**. Quit and
relaunch the app; the welcome flow appears again. This does not delete
your local belief data.

If you want a full clean slate, see
[Resetting the desktop app](../11-privacy-and-data/reset.md).
