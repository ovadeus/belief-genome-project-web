# Background workflows

By default an agent can only run when **Mission Control is open** —
the scheduler lives inside the app process. The **Background** toggle
extends that to "run even when the app is closed."

## When to use Background

Turn it on for:

- Daily morning briefings (you want the email in your inbox even if
  you didn't launch the app today)
- Watch-folder agents that should react to file drops in real time
- Anything that needs to fire at a specific time regardless of
  whether you happen to be at your desk

Turn it **off** for:

- Heavy or expensive workflows (each run incurs API costs whether
  you noticed it or not)
- Workflows that depend on you being interactively available
- Anything whose output is only useful in-app (e.g. updating a widget)

## How it works (macOS)

When you flip **Background** on for an agent, the desktop:

1. Generates a **launchd plist** for that agent under
   `~/Library/LaunchAgents/org.beliefgenomeproject.workflow.<agent-id>.plist`
2. Runs `launchctl load` on the plist so macOS picks it up
3. Stores a reference in your config (`workflows.background.<id>`)

When the schedule fires (or an event matches), launchd starts a
headless **Mission Control Worker** process — a stripped-down version
of the app with no UI, no window, no widget grid. The worker:

- Loads your config (same `mission-control-config.json`)
- Runs the one agent it was woken up for
- Logs the run to the same history file the UI reads
- Exits

The full UI process doesn't need to be running.

## How it works (Windows)

Background uses **Windows Task Scheduler**: one task per
background-enabled agent under `\BGP Mission Control\` in the task
hierarchy. The action is the headless worker; the trigger is your
configured schedule or event listener.

## How it works (Linux)

Linux background uses **systemd user services** —
`~/.config/systemd/user/bgp-workflow-<id>.service` and `.timer`. The
desktop registers them via `systemctl --user daemon-reload` then
`systemctl --user enable --now bgp-workflow-<id>.timer`.

## Verifying a background workflow

After enabling Background:

1. Click **Run Now** once to confirm the agent runs cleanly when the
   app is open.
2. Quit the app completely (⌘Q on macOS).
3. Wait for the next scheduled tick (check the cron expression).
4. Reopen the desktop. Check the agent's **History** panel — you
   should see a run with the timestamp matching the scheduled tick
   and a `[background]` tag on it.

If the background run didn't appear:

- macOS: `launchctl list | grep beliefgenome` — the agent's plist
  should be loaded. If missing, toggle Background off and back on
  to re-register.
- Windows: open Task Scheduler → "BGP Mission Control" folder.
- Linux: `systemctl --user status bgp-workflow-<id>.timer`.

## Disabling Background

Toggle **Background** off in the builder. The desktop unloads the
launchd / scheduled task / systemd unit and removes the file. Your
agent reverts to "open-app-only" behavior; the **Active** toggle still
controls whether it fires while the app is open.

## Background and macOS sleep

If your Mac is asleep, launchd queues the missed schedule and fires
it when the system wakes (with a small jitter). Battery-saver mode
can delay further. For mission-critical schedules consider running
on a desktop / always-on machine.

## Background and credentials

Background runs use the same OAuth tokens, API keys, and account
records as foreground runs — they all read from the same config
file. The only difference is no UI is shown.

If a background run fails because of an expired Gmail token, the
error logs to History but you won't see a notification (no UI to
fire one). Open the desktop next time and check the agent's run
history.

## Disabling all background workflows at once

**Settings → Workflows → "Disable all background workflows"** —
unloads every registered background unit without changing the
**Background** toggles in the builder. Useful when traveling
on metered connections or switching machines.
