# Media Library

The **Media Library** page (sidebar tab) collects every file your
agents have generated or saved — audio, transcripts, generated
media, saved research articles. One place to find everything you've
produced or curated through the desktop.

## Layout

A page header followed by three tabs:

- **All** — combined feed of every file
- **Media** — audio files (MP3, WAV, M4A), transcripts, generated
  speech, and any other media outputs
- **Saved Research** — articles you've explicitly saved from the
  Research Pulse widget or other research agents

Below the tabs sits the file list. Each row shows the file's icon,
name, type tag (color-coded), date, and per-row actions.

## Where files come from

| Source | Lands as |
|---|---|
| **Transcribe Audio File** agent | Transcript (text) tagged `transcript` |
| **Text → MP3** agent | Audio file tagged `audio` |
| **Transcribe YouTube** / **PDF** agents | Transcript |
| Workflow steps that explicitly write to Media Library | Tagged by step config |
| Research Pulse → "Save to Archive" | Tagged `research` |
| Manual import via drag-and-drop | Tagged based on file type |

Files are stored in your local app data folder. See
[Where your data lives](../11-privacy-and-data/data-locations.md).

## Type tags

Each card has a small color-coded type tag:

- **AUDIO** — purple, for any audio file (MP3, WAV, M4A, OGG)
- **TRANSCRIPT** — green, for text transcripts
- **RESEARCH** — blue, for saved articles
- **(other)** — neutral grey for anything that doesn't match the
  above patterns (PDFs, images, generic text files)

## Per-row actions

Hover any row to reveal:

- **Open** — opens the file with your default OS handler (audio in
  your default player, transcript in your text editor, research
  article in your browser)
- **Reveal in Finder / Explorer** — jumps to the file's location on
  disk
- **Delete** — removes the file. The desktop confirms before
  deleting, and this **does** delete the file from disk (not just
  the library entry).

## Refreshing the list

Click the refresh icon in the page header. The desktop re-scans
the media folder for any files added externally (e.g. you dragged
an MP3 in via Finder).

## Searching

The library doesn't currently have a built-in search bar — file
counts on personal accounts are usually small enough to scroll.
For large libraries, use the OS-native file search on the data
folder, or run a workflow with the `media.search` step.

## Storage size

The library can grow significantly if you generate a lot of audio
or save many research articles with full bodies. To check current
size: **Settings → Diagnostics → "Media library size."** To
prune, delete files individually or delete the whole folder via
**Reveal in Finder → ⌘⌫**.

## Sharing files

Right-click any row → **Share** uses the OS share sheet (macOS)
or the Send to menu (Windows). On Linux, this falls back to
opening Reveal in file manager.

For long transcripts, Markdown text is plain-text exportable —
**Open** opens it in your text editor where you can copy/paste.

## Saved Research deep-dive

Saved Research articles are full HTML snapshots — the article body
at save time, including images and formatting. They're stored
self-contained so they survive the original URL going dead. To
re-open an article in your browser, click **Open original URL**
from the row's expand state (the original URL is preserved as
metadata).

## Deleting all media

**Settings → Privacy & Data → "Clear Media Library"** removes
every file in the library folder with a confirmation prompt. Your
belief data, agent configs, and other settings are unaffected —
only the media folder is wiped.
