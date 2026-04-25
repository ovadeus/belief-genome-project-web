# Organize mode

The widget grid on Mission Control isn't fixed — every block can be
moved, hidden, resized (in some cases), or replaced. **Organize mode**
is the editor.

## Entering Organize mode

Click the **Organize** button in the top-right of the dashboard page
header. The button is intentionally one click away because rearranging
your dashboard is a common task, not a hidden setting.

What changes when you enter Organize mode:

- A subtle dashed outline appears around every widget.
- Each widget gets a **drag handle** (the title bar becomes draggable).
- Each widget gets a small **×** in its top-right corner — click it to
  hide that widget.
- A floating **+ Add Widget** button appears at the bottom of the grid.
- A **Done** button replaces the **Organize** button in the header.

## Moving widgets

Click and hold a widget's title bar. Drag it over another widget; the
target shows a blue placeholder. Release to drop. Adjacent widgets
reflow automatically.

The grid is responsive: widgets snap to the nearest column. There's no
free-form pixel placement — this keeps the layout consistent across
window sizes.

## Hiding widgets

Click the **×** on any widget. The widget disappears immediately. Your
hidden list is remembered locally (per device).

To bring a hidden widget back, click **+ Add Widget**. A picker opens
showing all widgets — currently visible ones are dimmed, hidden ones
are highlighted. Click any to add it back to the bottom of the grid.

## Resizable widgets

A few widgets respect size hints (data attribute `data-row-span`):

- **Notes** — can span 1–3 rows
- **Today's Agenda** — can span 1–2 rows
- **Research Pulse** — can span 1–3 rows

In Organize mode, hover the bottom edge of a resizable widget — a
**↕** handle appears. Drag down to add rows, up to remove.

## Saving and discarding

Click **Done** to commit your layout. The `widgets.layout` field in
your local config updates and (if connected) syncs to your web
account.

There's no explicit "Cancel" / "Revert" — changes apply as you make
them and persist immediately. To undo, click **Done** then re-enter
Organize and put things back. (We may add an undo stack in a future
release.)

## Resetting to default layout

**Settings → Display → Reset dashboard layout** restores the original
arrangement and re-shows any widget you'd hidden. Your data inside
each widget (tasks, notes, bookmarks, etc.) is **not** affected.

## Sync between devices

If you have BGP Mission Control on multiple machines and they're
signed into the same Belief Genome account, layouts try to sync — but
on first install per device the layout is a fresh default until you
explicitly **Pull layout from web** in Settings. This is to avoid
clobbering a layout you customized for a specific screen size.

## Keyboard shortcut

`⌘E` (macOS) / `Ctrl+E` (Windows/Linux) toggles Organize mode from any
page. (See [Keyboard Shortcuts](../09-keyboard-shortcuts/).)
