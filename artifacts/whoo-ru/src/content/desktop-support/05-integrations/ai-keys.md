# AI provider API keys

BGP Mission Control runs all AI work using your own API keys. Nothing
goes through Belief Genome's servers; you pay each provider directly.

The desktop supports four providers. You don't need all of them —
configure whichever you want.

## Where to add keys

**Settings → AI API Keys**. Each provider has its own field. The
**Save** button at the bottom commits all changes; the
connection-status panel in the sidebar updates within a few seconds
to show a green dot for each saved key.

Keys live in your local `mission-control-config.json` only — they
are **never** sent to Belief Genome's servers, and they aren't
included in the data that syncs to your web account.

## Claude (Anthropic)

**The default for most workflow steps**, including AI Author. If you
only configure one provider, configure this one.

- **Get a key:** [console.anthropic.com → Settings → API Keys](https://console.anthropic.com/settings/keys)
- **Format:** starts with `sk-ant-…`
- **Cost:** ~$3 per million input tokens (Sonnet), ~$15 per million
  output tokens. A typical AI Author generation is ~$0.05–0.08; a
  daily summary workflow is ~$0.01–0.03.
- **Models supported:** Sonnet 4 / Sonnet 4.5 / Sonnet 4.7
  (selectable in **Settings → AI Models**). Default is Sonnet 4.7
  for general use.

## OpenAI

Used by the **Whisper** audio transcription agent and any workflow
step explicitly configured to use GPT.

- **Get a key:** [platform.openai.com → API keys](https://platform.openai.com/api-keys)
- **Format:** starts with `sk-…`
- **Cost:** Whisper is $0.006/minute; GPT-4 mini is ~$0.15 per
  million input tokens
- **Why both Claude and OpenAI?** Whisper has no Claude equivalent
  (Claude doesn't transcribe audio). If you'll never use audio
  transcription, you can skip OpenAI.

## Gemini (Google AI Studio)

Optional alternate model for workflow steps that explicitly select
Gemini. No required features depend on it.

- **Get a key:** [aistudio.google.com → Get API key](https://aistudio.google.com/apikey)
- **Format:** typically starts with `AIza…`
- **Cost:** Gemini 1.5 Flash is free up to ~1500 requests/day for
  personal use; Gemini 1.5 Pro is paid

## ElevenLabs

Used by the **Text → MP3** agent (high-quality text-to-speech) and
any workflow step that needs speech synthesis.

- **Get a key:** [elevenlabs.io → Profile → API Key](https://elevenlabs.io/app/profile)
- **Format:** 32 hex characters
- **Cost:** free tier = 10k chars/month; paid plans for more
- **Optional:** if you don't use TTS, skip this — no other features
  require it.

## Where each key gets used

| Feature | Required key |
|---|---|
| Daily Focus widget | Claude (or OpenAI if Claude isn't configured) |
| Inbox Summary | Claude |
| AI Author | Claude |
| Most workflow templates | Claude |
| Workflow `ai.classify`, `ai.summarize`, `ai.generate` steps | Claude (default) — selectable per step |
| Forecaster | Claude |
| `audio.transcribe` step (Whisper) | OpenAI |
| Transcribe Audio File template | OpenAI |
| `tts.synthesize` step | ElevenLabs |
| Text → MP3 template | ElevenLabs |

If a step needs a key that isn't configured, the run will fail with
`Missing API key for <provider>`. Add the key in Settings, click Save,
and the next run will pick it up automatically — no app restart
needed.

## Switching the default model

**Settings → AI Models** lets you pick the default Claude model
(Sonnet 4 / 4.5 / 4.7) and the default OpenAI model (gpt-4o,
gpt-4o-mini). Workflows that didn't specify a model use these
defaults.

## Cost monitoring

The desktop logs token usage per workflow run when the provider
returns it (Anthropic and OpenAI both do; Google AI Studio's
`generateContent` does too on most endpoints). View per-run cost
estimates in **Workflow History → expand a run → "Cost" column**.

Aggregate costs across runs: **Settings → Diagnostics → "API usage
summary"** rolls up the last 7 / 30 days by provider.

These numbers are estimates based on the provider's published
pricing as of when the desktop shipped — for authoritative billing,
check each provider's dashboard.

## Rotating a key

If a key is compromised:

1. Revoke it in the provider's dashboard
2. Generate a new one
3. Paste the new key into Settings
4. **Save**

In-flight workflow runs that already started with the old key
will complete (the auth header was already sent). Future runs use
the new key.
