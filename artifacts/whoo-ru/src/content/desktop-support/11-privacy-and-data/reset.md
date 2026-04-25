# Resetting the desktop app

Three levels of reset, ordered from gentlest to nuclear. Pick the
one that matches what you're trying to accomplish.

## Level 1 — Reset onboarding only

**Settings → Privacy & Data → "Reset Onboarding"**

What it does:
- Clears the `onboardingComplete` flag so the welcome flow shows
  again on next launch

What it does NOT do:
- Doesn't delete your auth token
- Doesn't delete your API keys
- Doesn't delete connected integrations
- Doesn't delete any belief data

Use when: you want to walk through onboarding again, e.g. to
double-check the flow or take screenshots.

## Level 2 — Sign out of this device

**Settings → Privacy & Data → "Sign out of this device"**

What it does:
- Clears your Belief Genome auth token
- Clears your cached web profile email
- Resets `onboardingComplete` (so you'll go through welcome on
  next launch)

What it does NOT do:
- Doesn't delete API keys
- Doesn't delete connected Gmail / Outlook integrations
- Doesn't delete any belief data
- Doesn't touch the web account itself

Use when: you're handing the machine to someone else temporarily,
or you want to re-authorize from scratch without losing local
data.

## Level 3 — Full reset

**Settings → Privacy & Data → "Full Reset"**

What it does:
- Clears auth token, API keys, OAuth tokens, all integrations
- Clears widget content, layout, settings
- Clears workflow definitions and run history
- Resets onboarding

What it does NOT do (by default):
- Keeps belief responses, memories, passions, probe history

What it CAN do (with an extra opt-in):
- The reset dialog has a checkbox **"Also wipe all belief data"**.
  Ticking it ALSO deletes:
  - Every belief response you've ever logged
  - All lineage records
  - Memory log
  - Passions
  - Locally-cached probe bank
  - All generated media

Use when: you're giving the machine away permanently, or you
want a true clean slate.

## The hard gate on full data wipe

If you tick "Also wipe all belief data," the dialog requires
**type-to-confirm** — you have to type the literal string
`DELETE EVERYTHING` to proceed. This is intentional. No undo,
no recycle bin, no recovery.

Two confirmations because:
1. The data is irreplaceable (months/years of personal reflection)
2. The action is fast and irreversible (a single delete call,
   no soft-delete or grace period)
3. Any unsynced responses that haven't reached the web yet are
   lost forever — there's no backup outside this machine

If your responses ARE synced to your web account, you can
re-download by signing back in: the desktop pulls down everything
the web has on first sync. But anything that was local-only is
gone.

## Programmatic reset (advanced)

If the UI is broken or unreachable, you can reset from a terminal:

```sh
# Quit the app first
osascript -e 'tell application "BGP Mission Control" to quit'

# Sign out (preserves data)
rm ~/Documents/mission-control-config.json

# Full reset (wipes everything)
rm ~/Documents/mission-control-config.json
rm -rf "~/Library/Application Support/bgp-mission-control"
```

Both will trigger a fresh-install state on next launch.

## Backing up before a reset

Strongly recommended for Level 3 with the data-wipe checkbox. See
[Where your data lives](data-locations.md) for the backup
walkthrough — it's two `cp -R` commands.

## Re-installing after a reset

Re-running the installer doesn't restore anything — the installer
only updates the app binary. To restore data, put your backup
files back in their original locations:

```sh
# Config
cp /path/to/backup/mission-control-config.json ~/Documents/

# Brain data
cp -R /path/to/backup/brain-data \
  "~/Library/Application Support/bgp-mission-control/"
```

Then launch the app — it'll come up in the state of your backup.
