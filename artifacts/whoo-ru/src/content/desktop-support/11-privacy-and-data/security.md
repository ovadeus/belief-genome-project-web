# Security & threat model

A frank look at what BGP Mission Control protects, what it doesn't,
and what your responsibilities are.

## What's stored on disk

In plain JSON, in your home folder:

- AI provider API keys (Claude, OpenAI, Gemini, ElevenLabs)
- Gmail / Outlook OAuth refresh tokens
- Belief Genome web account auth token
- Years of personal reflections, beliefs, and probe responses

This is sensitive data. Treat the machine running BGP Mission
Control like you'd treat the machine running your password
manager.

## What we do at the app level

- **HTTPS-only** for every outbound network call
- **Certificate pinning** for `beliefgenomeproject.org` (rejects
  proxies / MitM)
- **No telemetry** by default — the app never phones home with
  usage data, error reports, or "improving the product" pings
- **No analytics SDKs** in the renderer
- **CSP** (Content Security Policy) on the renderer that blocks
  inline scripts from observed content (defends against rogue
  HTML in fetched pages, e.g. an article's body)
- **Context isolation** in the Electron renderer (the renderer
  can't directly access Node modules or the filesystem)
- **Preload bridge** — only the IPC methods we expose are callable
  from the renderer; you can't sneak in arbitrary FS access

## What we DON'T do

- **App-level encryption of the config file.** It's plain JSON.
  Anyone with read access to your home folder can read your API
  keys. We rely on the OS for this protection (FileVault, etc.)
  rather than adding our own crypto layer.
- **Network sandboxing.** Workflows can call any URL you tell them
  to call. A malicious workflow you imported could exfiltrate
  your config to a server you don't control.
- **Code signing on macOS.** As of v0.1.0, the macOS app is
  unsigned (Gatekeeper warning on first launch). We're working on
  Apple Developer signing.

## Your responsibilities

### Use full-disk encryption

The single highest-impact thing you can do:

- **macOS:** enable FileVault (System Settings → Privacy &
  Security → FileVault → Turn On)
- **Windows:** enable BitLocker (Settings → Update & Security →
  Device encryption)
- **Linux:** install with LUKS, or set up `cryptsetup` post-install

With FDE on, an unauthenticated thief can't read your config
file even if they extract the disk.

### Don't import untrusted workflows

Workflow JSON includes:
- URLs that get fetched
- AI prompts that get executed with your keys
- Email addresses that receive your messages

A malicious workflow can do anything those primitives allow. Only
import workflows from sources you trust. **AI Author**-generated
workflows are safe (they only use steps from the allow-listed
registry); manually-crafted JSON imports could embed arbitrary
URLs and addresses.

### Rotate API keys when needed

If a key may have been exposed (committed to a public repo, sent
in plaintext over an insecure channel, used on a machine you no
longer trust), rotate it:

1. Revoke in the provider's dashboard
2. Generate a new one
3. Paste into Settings → AI API Keys
4. Save

In-flight workflow runs that already started with the old key
will complete; new runs use the new key.

### Use a dedicated AI provider account

If you're concerned about an AI provider's data handling, use a
dedicated account / project / API key for BGP Mission Control,
separate from your other workflows. Lets you cap spend and
inspect usage in isolation.

## Threat model summary

The desktop is built to protect you from:
- ✅ Network adversaries (HTTPS, cert pinning)
- ✅ Malicious websites the renderer browses (CSP, context isolation)
- ✅ Provider data leakage (no extra layer; same as using their API directly)
- ✅ Belief Genome staff snooping on your local data (we never see local data unless you sync)

It does NOT protect you from:
- ❌ Local attackers with read access to your home folder
- ❌ Malicious workflows you import
- ❌ A compromised AI provider (their privacy policy applies)
- ❌ A compromised dependency (`googleapis`, `axios`, etc.) — we use
  pinned versions and Lockfile, but supply-chain risk is real

## Reporting a security issue

If you find a vulnerability, please disclose privately:

- Email: `security@beliefgenomeproject.org`
- Or the contact form at beliefgenomeproject.org/security

We aim for an acknowledgement within 48 hours and a patch within
2 weeks for high-severity issues.

Please don't open public issues for security problems before
they're fixed. We honor responsible disclosure timelines.
