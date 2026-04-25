# Where your data lives

BGP Mission Control stores everything locally. No belief data, agent
config, or personal credentials touches Belief Genome's servers
unless you've explicitly connected your web account — and even then,
sync is opt-in per data type.

## The two main folders

### Config + integrations

**macOS:** `~/Documents/mission-control-config.json`
**Windows:** `%USERPROFILE%\Documents\mission-control-config.json`
**Linux:** `~/Documents/mission-control-config.json`

Contains:
- AI provider API keys
- Connected Gmail / Outlook account records (including OAuth tokens)
- Belief Genome web account auth token
- Widget layouts and content (notes, tasks, bookmarks, important
  dates, etc.)
- Workflow definitions
- All Settings page values

Why `~/Documents` and not Application Support? Historical — early
versions chose Documents for visibility (users wanted to know
where their data was). Future versions may migrate to the
platform-conventional location.

### Brain data

**macOS:** `~/Library/Application Support/bgp-mission-control/brain-data/`
**Windows:** `%APPDATA%\bgp-mission-control\brain-data\`
**Linux:** `~/.config/bgp-mission-control/brain-data/`

Contains:
- `belief_responses.json` — every probe answer with metadata
- `belief_lineage.json` — score-transition trace per response
- `probes.json` — local probe cache (the bank you draw from offline)
- `agent_logs.json` — full workflow run history
- `memories.json` — entries from the "Memory" feature
- `memory-log.json` — append-only log of memory operations
- `passions.json` — declared topics of interest

These are append-only or update-in-place JSON files. Easy to
inspect, easy to back up.

## Other folders

### Media library

**macOS:** `~/Library/Application Support/bgp-mission-control/media/`

Generated audio, transcripts, saved research. Files are
free-floating; the Media Library page just renders a directory
listing with metadata.

### Cached background photos

**macOS:** `~/Library/Application Support/bgp-mission-control/bg-photos/`

If you use Unsplash backgrounds, photos are downloaded and
cached here. Safe to delete; the next refresh re-downloads as
needed.

### Renderer cache

**macOS:** `~/Library/Application Support/bgp-mission-control/Cache/`

Standard Chromium cache (HTTP responses for the renderer's
fetch calls). Deletable with no data loss.

## Backing up your data

A complete backup of everything personal:

1. Quit the app
2. Copy `~/Documents/mission-control-config.json`
3. Copy `~/Library/Application Support/bgp-mission-control/brain-data/`
4. (Optional) copy `media/` if you have generated content you
   want to preserve

Restore by putting the files back in the same locations and
relaunching. You can move data between machines this way too —
the desktop is portable as long as the OS-level paths are the
same.

## What gets included in iCloud / OneDrive sync

If your `~/Documents` folder is in iCloud (a common macOS
default), `mission-control-config.json` will sync between Macs.
This is convenient but **be aware**:

- Your Gmail / Outlook OAuth tokens sync along with everything
  else — which is fine if it's all your machines, less fine if
  Documents is shared
- Your AI API keys sync — same caveat

If you want strict isolation, move `mission-control-config.json`
out of `~/Documents` and create a symlink. (Future versions will
respect a `BGP_CONFIG_PATH` environment variable for this.)

The brain-data folder is in Application Support and is not
typically synced by iCloud or OneDrive.

## What gets included in Time Machine / file backups

Both folders are backed up by Time Machine and any other
backup-everything tool. No special exclusion is needed.

## Inspecting your data

The JSON files are human-readable. Use any text editor:

```sh
cat ~/Documents/mission-control-config.json | head -50
cat ~/Library/Application\ Support/bgp-mission-control/brain-data/belief_responses.json | python3 -m json.tool | head -50
```

For pretty-printing and querying, `jq` is excellent:

```sh
jq '.widgets.importantDates | length' ~/Documents/mission-control-config.json
jq '. | length' ~/Library/Application\ Support/bgp-mission-control/brain-data/belief_responses.json
```

## Don't edit while the app is running

The desktop reads-and-writes these files during normal operation.
Editing them while the app is running can cause writes to clobber
your changes, or the app to crash on a malformed JSON it
accidentally read mid-edit. Always quit the app before editing
files manually.
