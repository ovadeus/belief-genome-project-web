# Common errors

A grab-bag of errors you might see and what to do about them. For
errors specific to integrations or workflows, see those sections;
this page covers the catch-all.

## "Cannot find module '…'"

Shown in the DevTools console at startup. Usually means the
packaged app is missing a sub-module of a node-modules dependency
(e.g. an `apis/docs` folder of `googleapis`).

**Fix:** install the latest build. v0.1.0+ ships a complete
`node_modules/googleapis` tree.

## "window.mc.X is not a function"

A renderer-side TypeError where the renderer expected an IPC
method that doesn't exist on the preload bridge. Almost always
the result of a partial / mismatched build (renderer is newer
than main process or vice versa).

**Fix:** re-download the installer; install fresh. If it persists,
file an issue with the build version, the exact error text, and
the stack trace from DevTools.

## "Quota exceeded" / 429 from an AI provider

You've hit a per-minute or per-day rate limit. The runner retries
with backoff but can't help if you're truly out of quota.

**Fix:**
- Wait an hour
- Reduce frequency for scheduled agents
- Top up your provider account

## "Network error" on every API call

The desktop's local DNS or firewall might be blocking outbound
HTTPS. Test:

```sh
curl https://api.anthropic.com
curl https://www.googleapis.com
```

Both should return some response (even if it's an auth error —
that's fine, means the connection works). If they hang or
fail, the issue is your network, not the app.

## App opens but the window is invisible

Common after disconnecting an external monitor — the app
remembers its window position from before, which is now
off-screen.

**Fix:** Right-click the app icon in the Dock → Window → Bring
to Front, or quit and run:

```sh
defaults delete org.beliefgenomeproject.desktop NSWindow.*
```

Then relaunch.

## App hangs at startup with a spinning beach ball

If macOS shows a "force quit" dialog or the app just won't
respond:

1. Force quit: ⌘⌥Esc → BGP Mission Control → Force Quit
2. Open Activity Monitor → search "BGP Mission Control" →
   confirm no zombie processes
3. Relaunch

If it consistently hangs at the same point, capture the stack
with Activity Monitor's "Sample Process" while it's hung and
include in a bug report.

## "Renderer process gone" / app suddenly closes

The renderer crashed. Most common causes:

- A workflow step generated a huge output that overwhelmed the
  renderer's memory (very rare)
- A bug in a custom workflow (e.g. an infinite loop in a
  template literal expression)
- An Electron / Chromium version issue with your specific GPU
  driver

**Fix path:** look at the log file (`Settings → Diagnostics →
Open log file`), find the last few lines before the crash, and
file an issue.

## "OAuth state mismatch"

Sign-in flows include a `state` parameter to prevent CSRF. If
the OAuth flow takes too long (more than ~10 minutes between
clicking Connect and finishing on the provider's site), the
state expires and the callback rejects.

**Fix:** click Connect again to start a fresh flow. Don't pause
mid-flow.

## A widget shows "Failed to load"

Specific widget errors usually mean the widget's data source is
broken, not the app:

- **Today's Agenda** "Failed" → no calendar connected, or the
  connected one rejected the API call
- **Inbox Summary** "Failed" → see [Reconnect Gmail](reconnect-gmail.md)
- **Research Pulse** "Failed" → check Sources in Settings; one
  of them might be returning HTML that doesn't parse

In Organize mode, you can hide a chronically-failing widget
while you debug.

## When all else fails

`Settings → Diagnostics → Export support bundle` produces a ZIP
with:

- Your `mission-control-config.json` (with all keys redacted)
- The last 1000 lines of the Electron main-process log
- Recent agent run history
- App version, OS version, Electron version

Email this to support — it's almost always enough to diagnose.

## When to do a full reset

A full reset (Settings → Privacy & Data → Full reset) wipes the
app's local state: configs, OAuth tokens, agent history,
optionally your belief data too. **This is a last-resort move**
because it's irreversible — back up first.

See [Full reset](../11-privacy-and-data/reset.md) for the
walkthrough including the safe variants that preserve your
belief data.
