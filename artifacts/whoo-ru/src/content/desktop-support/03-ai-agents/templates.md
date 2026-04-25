# Cloning a template

The fastest way to get a useful agent running is to start from one of
the 24 prebuilt templates and customize. This page walks through the
process and what to expect.

## What's in a template

Each template is a complete, runnable agent — trigger, steps, prompts,
input fields, and output target are all pre-configured. They're tuned
to "good enough" defaults; cloning gives you a working baseline you
can edit freely without breaking the original.

## How to clone

1. **AI Agents** in the sidebar → scroll to **Start from Template**.
2. Optional: filter by category at the top (All / Email / Research /
   Social / Productivity / Data).
3. Click any template card. The card opens directly into the builder
   as **a new entry under My Agents** (the original template stays
   untouched in the library).
4. The builder shows the trigger, steps, and any input fields. Edit
   them as needed.
5. Click **Save** in the top-right (or any field with an `onblur`
   save like the agent name).

## What you usually need to change

Most templates work as-is once you've connected the right
integrations. The most common edits:

| Template | What to customize |
|---|---|
| **Daily Spam Cleanup** | Threshold for "bulk" sender (default: 5+ messages in 30 days) |
| **Daily Unread Digest** | Recipient address (your own; defaults to the connected account) and time of day (default 8 AM) |
| **Email Receipt → Sheets** | Sheet ID + tab name to write to |
| **Morning Schedule Briefing** | Recipient + which calendars to include |
| **AI News Aggregator** | Source feed list, summary length |
| **Meeting Prep Automation** | Look-ahead window, output destination (email vs Notes) |
| **PDF Transcribe** | None — manual trigger; it just needs a PDF input |

If a template lights up red error icons in the builder, hover them —
they almost always mean a missing connection (Gmail not connected,
no Sheets API key, etc.). Fix the underlying integration in Settings,
return to the agent, and the errors clear.

## Renaming and re-icon

Click the agent name in the builder header → type a new name → the
field auto-saves on blur. Click the icon (left of the name) to pick
a new emoji — purely cosmetic, helps you spot the agent in the
gallery.

## Activating

Toggling **Active** in the top-right enables the agent's trigger:

- For **Schedule** triggers: the cron starts firing
- For **Event** triggers: the event listener wires up
- For **Manual** triggers: the toggle is irrelevant; just click Run
  Now

Inactive agents still appear in My Agents but are skipped by the
scheduler.

## Deleting your clone

In the builder header, the trash icon (top-right of the action bar)
deletes your clone. Confirm in the prompt. Templates in the library
are unaffected — you can clone again anytime.

## Sharing a clone

Workflows are shareable as JSON. **Builder → … menu → Export JSON**
saves a `.json` file. The recipient can **Builder → + New Agent →
Import JSON** to load yours. Note that any references to specific
account IDs, sheet IDs, or other personal artifacts will need to be
re-pointed by the recipient.

## See also

- [Workflow builder](builder.md) — full editor reference
- [Step reference](step-reference.md) — every step type and what it does
- [Scheduling & triggers](scheduling.md)
