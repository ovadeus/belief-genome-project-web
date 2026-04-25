# Widget reference

A field guide to every widget on Mission Control: what it does, what
data it uses, and how to configure it.

## Today's Agenda

**What:** Calendar events for today and (optionally) tomorrow, sorted
chronologically.

**Source:** Any Google Calendar or Microsoft 365 calendar you've
connected via **Settings → Integrations**. If multiple calendars are
connected, events from all of them merge into one list.

**Configuration:** None — it auto-loads. To change which calendars are
included, open Settings → Integrations and toggle individual calendars
on/off after connecting.

**Click an event** → opens the event in your default web browser
(Google) or in the Outlook app (Microsoft).

---

## Tasks

**What:** A lightweight one-tap checklist. Type a task, hit Enter,
check it off when done.

**Source:** Local-only. Tasks live in `widgets.tasks` in your config
file and sync to your web account if connected.

**Tips:**
- Drag-reorder by holding a row's left edge.
- Completed tasks gray out and drop to the bottom.
- The widget doesn't track due dates — for time-bound work, use the
  Important Dates widget or schedule a workflow.

---

## Bookmarks

**What:** A grid of clickable chips — each opens a URL in your default
browser.

**Configuration:** Click the **+** in the widget header → paste a URL
and a label → Add. Edit existing chips by clicking the pencil. Drag
to reorder.

**Auto-favicon:** the chip icon is fetched from the site's favicon
once on add. If a site changes its favicon, click the chip's pencil →
**Refresh icon**.

---

## Launchpad

**What:** Quick launch tray for native apps on your machine.

**Configuration:** Click **+** → browse to the `.app` (macOS), `.exe`
(Windows), or executable (Linux) → Add. Drag to reorder.

**On macOS** the dropdown lists apps from `/Applications` and
`~/Applications` automatically; you don't have to navigate.

---

## Notes

**What:** A rich-text notepad for quick-capture thoughts. Markdown-style
shortcuts work (`**bold**`, `# heading`, `- list`).

**Source:** Local-only. Synced to web if connected.

**Multi-note:** Click the **+** in the widget header to start a new
note; tabs across the top let you switch between them.

---

## Deep Work

**What:** Pomodoro timer with a session log.

**Defaults:** 50 min focus, 10 min break (configurable). Click **Start**
and the timer counts down; the widget gives a soft chime when each
phase ends. Sessions auto-log to the **Deep Work history** so you can
see how long you actually focused this week.

**Configuration:** Click the gear inside the widget to change phase
durations or disable the chime.

---

## Habits

**What:** Yes/no daily habit tracker. Each row is a habit; each column
is a day; check or uncheck per day.

**Configuration:** **+** to add a habit. Drag to reorder. Long-press a
day cell to add a note (e.g. "skipped — sick day").

**Streak counter:** the colored dot to the left of each habit row is a
9-color streak indicator (red = broken, green = on track, blue = strong
multi-week run). Hover for the exact streak length.

---

## Countdowns

**What:** Days-until counters for arbitrary targets ("Vacation in 23
days," "Conference in 47 days").

**Configuration:** **+** → label + target date. Toggle "Show as
percentage progress bar" for a visual countdown.

---

## Important Dates

**What:** Birthdays, anniversaries, holidays, and other recurring or
one-off dates. Each entry can optionally email a recipient on the date.

See [Important Dates & Reminders](../06-important-dates/) for the full
walkthrough including the email reminder system.

---

## MusicPax

**What:** Connected music library / playback. Search and play tracks,
view queue, see what's playing.

**Source:** Requires MusicPax to be configured (see
[Settings → Integrations → MusicPax](../05-integrations/musicpax.md)).
Without a connection, the widget shows a "Not connected" hint.

---

## Daily Focus

**What:** One AI-generated focus prompt per day, derived from your
recent reflections, your DNA leans, and the calendar.

**Source:** Generated locally via your Claude (or fallback) API key.
Costs roughly 2–3¢ per generation depending on provider.

**Refresh:** Click **Run Now** in the widget header to regenerate. The
widget caches today's prompt — subsequent loads on the same day return
the cached value, not a new API call.

---

## Inbox Summary

**What:** AI-summarized digest of unread email across all connected
Gmail / Outlook accounts.

**Source:** Connected mail accounts. Each account is fetched in
parallel; summaries are merged.

**Auth errors:** if any account fails to authenticate, the widget shows
inline `⚠️ <email> — auth error` and links to Settings → Integrations.
See [Reconnecting Gmail](../10-troubleshooting/reconnect-gmail.md).

**Configuration:** Click the gear inside the widget to set "max threads
per account" (default 25) and "look-back hours" (default 24).

---

## Research Pulse

**What:** Latest articles from your configured research feed sources.
Each card shows headline, source, and a short AI-generated TLDR.

**Source:** Sources are configured per-feed in **Settings → Research →
Sources** (web, Reddit, RSS, Hacker News, etc.). The agent fetches new
items every few hours.

**Click an article** → expands inline; from the expanded view you can
**Save to Archive** (lands in Media Library → Saved Research) or
**Promote to Probe** (turns the article into a one-click probe in the
bottom bar).
