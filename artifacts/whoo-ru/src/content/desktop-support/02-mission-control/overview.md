# Mission Control overview

The **Mission Control** page (the dashboard) is the home screen of the
desktop app. It surfaces everything you'd otherwise have to hunt for:
today's agenda, your daily reflection, recent media, bookmarks, notes,
deep work timer, important dates, your inbox summary, the launchpad for
your favorite apps, the daily focus prompt, and more.

The whole page is a **widget grid** — every block is a widget you can
move, hide, or rearrange.

## Anatomy of the dashboard

From top to bottom:

1. **Page header** — greeting that changes by time of day, today's date,
   and an optional inline "daily quote." On the right: the **Refresh
   background** button, the **Organize** button (drag-and-drop layout
   editing), and any other dashboard-scoped actions.
2. **Background photo** — full-window ambient image from Unsplash,
   rotated daily by default. Disable / change source in Settings.
3. **Widget grid** — your selected widgets, laid out in a flexible grid.
4. **Probe widget (sticky bottom)** — the always-on "answer one belief
   probe" bar. See [The probe widget](probe-widget.md).
5. **Sidebar (left)** — page navigation (Mission Control, AI Agents,
   Media Library, Belief Genome), the connection-status panel, the
   settings gear, and the UI zoom buttons.

## Default widgets

A fresh install ships with these widgets visible:

| Widget | What it does |
|---|---|
| **Today's Agenda** | Calendar events for today + tomorrow if connected |
| **Tasks** | Lightweight to-do checklist (local-only) |
| **Bookmarks** | Pin frequently-used URLs as launch chips |
| **Launchpad** | Pin frequently-used local apps as chips |
| **Notes** | Quick-capture rich-text notes |
| **Deep Work** | Pomodoro-style timer with session log |
| **Habits** | Yes/no daily habit tracker |
| **Countdowns** | Days until specified targets |
| **Important Dates** | Birthdays, anniversaries, holidays — with optional email reminders |
| **MusicPax** | Connected music library / playback (if MusicPax is configured) |
| **Daily Focus** | A single AI-generated focus prompt for today |
| **Inbox Summary** | AI summary of unread email across connected Gmail accounts |
| **Research Pulse** | Latest articles from your configured research feed sources |

Most also have a **+** in the top-right to add new entries inline, and a
**pencil** to edit existing ones.

## Adding, removing, and rearranging widgets

Click the **Organize** button in the page header (top right). The grid
enters edit mode:

- Each widget gains a drag handle and a **×** in its top-right corner.
- Drag any widget by its title bar to a new grid cell.
- Click **×** to hide a widget. Hidden widgets are remembered per
  device.
- Click **+ Add Widget** at the bottom of the grid to bring back a
  hidden widget or add one you've never used.

Click **Done** to save the layout. The arrangement is stored locally
(`widgets.layout` in your config) and synced to the web account if
connected.

## Background images

The dashboard cycles ambient photos from Unsplash. To force a new image,
click the **Refresh background** button (the looping-arrow icon, top
right). To pick a specific theme, see
[Backgrounds](backgrounds.md). To disable entirely (for a flat
black background), uncheck "Use Unsplash backgrounds" in Settings.

## Idle fade

After 30 seconds of no mouse movement, the widget grid and dashboard
chrome fade out, leaving just the photo and the bottom probe bar. Any
mouse movement brings them back. This makes Mission Control double as
an ambient screen between active sessions.

You can disable idle fade in **Settings → Display**.
