# Keyboard shortcuts

Power-user reference. Bindings shown with the macOS modifier (`⌘`);
on Windows/Linux, replace `⌘` with `Ctrl` and `⌥` with `Alt`.

## Navigation

| Shortcut | Action |
|---|---|
| `⌘1` | Mission Control |
| `⌘2` | AI Agents |
| `⌘3` | Media Library |
| `⌘4` | Belief Genome |
| `⌘,` | Settings |
| `⌘E` | Toggle Organize mode (dashboard) |

## Window

| Shortcut | Action |
|---|---|
| `⌘W` | Close current window (mini mode if dashboard) |
| `⌘Q` | Quit the app |
| `⌘M` | Minimize current window |
| `⌃⌘F` | Toggle fullscreen |
| `⌘\\` | Toggle sidebar collapse / "peek" |

## Probe widget (bottom bar)

| Shortcut | Action |
|---|---|
| `⌘P` | Move focus to the probe slider |
| `Enter` (slider focused) | Submit current probe |
| `Esc` (slider focused) | Move focus away (doesn't submit) |
| `S` (slider focused) | Skip current probe |
| `←` / `→` (slider focused) | Move slider 1 unit |
| `⇧←` / `⇧→` | Move slider 5 units |

## Belief Genome page

| Shortcut | Action |
|---|---|
| `1`–`9` (in the page) | Switch viz tabs |
| `Esc` | Close lineage drawer / fullscreen viz |
| `F` | Toggle fullscreen for the active viz |

## AI Agents page

| Shortcut | Action |
|---|---|
| `⌘N` | New agent |
| `⌘R` | Run current agent (in builder) |
| `⌘⇧R` | Run as test (dry-run) |
| `⌘H` | Open run history (in builder) |

## Hidden / discovery

| Shortcut | Action |
|---|---|
| `b` `g` `p` (anywhere outside inputs, within 1.2s) | Toggle the [Harmonize DNA](../04-belief-genome/harmonize.md) Easter egg |

## Custom shortcuts

There's no in-app shortcut customization yet. If you want a
different binding, open an issue with the desired mapping and we'll
either add it as a setting or change the default if there's
agreement.

## Conflicts with macOS / Windows

A few default bindings overlap with system shortcuts:

- `⌘E` overlaps with macOS "Eject" (rarely used now); we picked it
  for Organize because the muscle memory works
- `⌘P` is "Print" in many apps; the desktop deliberately doesn't
  bind a Print action because nothing here is print-friendly. If
  you've trained your fingers to hit ⌘P expecting Print, sorry.

If you find a conflict that breaks your workflow, you can disable
the desktop's binding via **Settings → Keyboard → "Disable in-app
shortcut"**.
