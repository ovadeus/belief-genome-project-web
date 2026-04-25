# BGP Mission Control — Desktop App Support

Comprehensive help documentation for the **BGP Mission Control** desktop app
(macOS / Windows / Linux). Pair these articles with the web help center for
the full Belief Genome Project documentation set.

The desktop app is the always-on companion to your Belief Genome account: it
holds your local belief data, runs your AI agent workflows, and surfaces
your daily reflections, schedule, media, and integrations from one window.

---

## Categories

| # | Category | What's inside |
|---|---|---|
| 01 | [Getting Started](01-getting-started/) | Install, first launch, signing in, connecting your BGP web account |
| 02 | [Mission Control (Dashboard)](02-mission-control/) | The widget grid, organize mode, the probe bar, backgrounds |
| 03 | [AI Agents](03-ai-agents/) | Templates, the workflow builder, AI Author, scheduling, run history |
| 04 | [Belief Genome](04-belief-genome/) | All eight visualizations, the lineage drawer, the Harmonize Easter egg |
| 05 | [Integrations](05-integrations/) | Google (Gmail + Calendar), Microsoft, AI keys, zBinder, MusicPax |
| 06 | [Important Dates & Reminders](06-important-dates/) | Email reminders, "Send test now," common send failures |
| 07 | [Media Library](07-media-library/) | Generated audio, transcripts, saved research, downloads |
| 08 | [Settings](08-settings/) | Every settings page section explained |
| 09 | [Keyboard Shortcuts](09-keyboard-shortcuts/) | Power-user reference card |
| 10 | [Troubleshooting](10-troubleshooting/) | Common errors and how to fix them |
| 11 | [Privacy & Data](11-privacy-and-data/) | Where data lives, sync rules, full reset, security |

---

## Quick links to common questions

- **Installing for the first time?** → [Install & first launch](01-getting-started/install.md)
- **"Reconnect required" badge on Gmail?** → [Reconnecting an integration](10-troubleshooting/reconnect-gmail.md)
- **Important Dates not sending email?** → [Why my reminder didn't send](06-important-dates/troubleshooting.md)
- **Want to play your DNA as music?** → [The Harmonize Easter egg](04-belief-genome/harmonize.md)
- **App icon missing or broken?** → [Icon cache and Finder issues](10-troubleshooting/icon-cache.md)
- **How does my data sync to the web?** → [Sync model](11-privacy-and-data/sync-model.md)

---

## Format notes for downstream publishing

- Every article is a single Markdown file under a numeric-prefixed category
  folder. Numbers control display order; drop them when publishing if your
  CMS sorts alphabetically by title.
- Cross-references use relative paths so the set is self-linking on disk
  and on the web.
- No frontmatter is included — add provider-specific YAML (Hugo, MkDocs,
  GitBook, etc.) at publish time as needed.
- Article titles use sentence case. H1 of each file = page title.
- Code samples and key chords use backticks. Filesystem paths use backticks.
- Where the desktop and web companion behave the same, articles say so
  explicitly and link out to the corresponding web help page.

---

## Versioning

Documentation in this directory tracks the **`main`** branch of the desktop
app. When a major feature ships or breaks compatibility, bump the version
note at the top of the affected article (`Updated for v0.x.x`).
