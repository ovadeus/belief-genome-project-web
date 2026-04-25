# System requirements

BGP Mission Control is an Electron 28 app, so it needs roughly what a
modern Chromium-based browser would.

## macOS

- **Operating system:** macOS 11 Big Sur or newer (12 Monterey+ recommended)
- **Architecture:** Apple Silicon (M1/M2/M3/M4) **or** Intel x64
- **RAM:** 4 GB minimum, 8 GB recommended (the app idles around 250 MB
  but workflow steps that load large models can briefly spike to 1 GB+)
- **Disk:** ~250 MB for the app itself; data folder grows over time but
  rarely exceeds a few hundred MB even with thousands of reflections
- **Internet:** required for AI calls, web account sync, and most
  workflow steps. Many Belief Genome features still work offline once
  cached (DNA visualizations, reflection history, lineage drawer).

## Windows

- **Operating system:** Windows 10 (1809) or newer; Windows 11 fully
  supported
- **Architecture:** x64 only (no ARM build yet)
- **RAM / disk:** same as macOS

## Linux

- **Distro:** any modern desktop distro that runs AppImages — tested on
  Ubuntu 22.04+, Fedora 38+, Pop!_OS 22.04
- **Architecture:** x64 only
- **GPU:** software rendering works, but for the 3D Neuromap and Triple
  Helix visualizations a GPU with WebGL2 support is strongly recommended

## Network access

The app makes outbound HTTPS connections to:

- `beliefgenomeproject.org` — your account, sync, web help
- AI provider endpoints you've configured (Anthropic, OpenAI, Google,
  ElevenLabs) — only when those agents run
- `images.unsplash.com` — background photos (disable in Settings if you
  don't want this)
- Whatever endpoints your custom workflows call — e.g. RSS feeds, X/Twitter,
  YouTube, Google Sheets, Drive

There is **no** persistent inbound connection. The desktop never opens
a server port to the internet.

## Permissions you may be asked for

Depending on which features you use:

| Permission | When prompted | Why |
|---|---|---|
| Notifications | First time a workflow finishes / Important Date fires | Banner alerts |
| Microphone | First time a voice-input feature runs | Dictation, voice notes (optional) |
| Camera | First time avatar capture runs | Optional avatar (you can decline) |
| Folder access | First "Watched folder" agent runs | Reading documents you've explicitly watched |
| Calendar | "Today's Agenda" widget loads | Reading events from connected calendar(s) |

You can revoke any of these later via **System Settings → Privacy &
Security** (macOS) or **Settings → Privacy** (Windows). The app degrades
gracefully — features that need the permission show an inline hint
asking you to grant it.
