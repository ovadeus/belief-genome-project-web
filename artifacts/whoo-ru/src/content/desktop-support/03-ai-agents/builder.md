# The workflow builder

The builder is where an agent's trigger, steps, and outputs get
configured. It opens whenever you click into an agent from the
gallery, or when you create a new one (**+ New Agent** button).

## Layout

```
┌────────────────────────────────────────────────────────┐
│  ← AI Agents / [Agent Name editable]   ⏵ Run Now …    │
├──────────────────────────┬─────────────────────────────┤
│                          │                             │
│  Description             │   Step pipeline             │
│  Input fields            │   ┌─ Step 1 ────────────┐   │
│                          │   │ AI: Summarize       │   │
│  Trigger                 │   ├─ Step 2 ────────────┤   │
│                          │   │ Email: Send         │   │
│                          │   └─────────────────────┘   │
│                          │   + Add step                │
└──────────────────────────┴─────────────────────────────┘
```

- **Left rail** — agent description, runtime input fields (manual
  triggers only), and the trigger configuration
- **Right pane** — the step pipeline, one step per row, plus an **Add
  step** button at the bottom

## The header bar

| Element | What it does |
|---|---|
| `← AI Agents` | Back to gallery |
| Agent name (editable) | Click to rename; saves on blur |
| **Active** toggle | Arms / disarms the trigger |
| **Background** toggle (some triggers only) | Run even when the app is closed (see [Background workflows](background-workflows.md)) |
| **History** | Open run history panel |
| **Test Run** | Dry-run with side effects stubbed |
| **Run Now** | Execute immediately |
| Trash | Delete this agent |

## Steps

Each step is a single, discrete unit of work. Steps come from a
**registry** of step types (see [Step reference](step-reference.md)).
Common categories:

- **AI** — Claude, OpenAI, Gemini calls. Generate text, classify, summarize.
- **Email** — Read inbox, send, move, tag.
- **Web** — Fetch a URL, parse a feed, scrape with a CSS selector.
- **X / Twitter** — Read timeline, post, search.
- **YouTube** — Get transcript, list channel videos.
- **File** — Read/write local files, watch a folder.
- **Sheets** — Read/write Google Sheets ranges.
- **Drive** — Upload, list, search Google Drive.
- **Notify** — Show a desktop notification, write to a widget.
- **Multi** — Branching, looping, joining.

### Editing a step

Click any step row to open its **config drawer** on the right. Every
step exposes its inputs (what it needs to run) and outputs (what it
emits for downstream steps). Inputs can be:

- **Static values** — a string you type
- **Variable references** — `{{step1.output.summary}}` pulls a field
  from a previous step's output
- **Agent input fields** — `{{input.url}}` pulls from a manual-run
  input field you defined on the left

Auto-completion suggests valid references as you type `{{`.

### Reordering and removing steps

Drag the row by its left handle to reorder. Click the **×** in the
top-right of any step to delete (with a confirmation).

### Branching

Add a **Multi: Branch** step to evaluate a condition and run different
sub-pipelines for true/false. Sub-pipelines themselves are full step
lists, recursively.

## Triggers

The **Trigger** card on the left rail picks one of:

- **Manual** — agent only runs when you click **Run Now** or invoke it
  from another agent
- **Schedule** — cron expression with a friendly editor (every 5 min,
  hourly, daily at 8 AM, weekdays at noon, etc.)
- **Event** — fires when something specific happens:
  - `email:new` — new unread email matching a filter
  - `file:changed` — file in a watched folder modified
  - `probe:answered` — you submit a belief probe
  - `agent:finished` — another agent completed (chain agents)
  - `time:morning` / `time:evening` — soft daily hooks
  - … etc. See [Step reference → Triggers](step-reference.md#triggers).

Schedule and Event triggers only fire when the agent's **Active**
toggle is on.

## Input schema (manual triggers)

Manual-trigger agents can declare **input fields** that the user fills
in each run. Example: a "Transcribe YouTube" agent has one input
field, `url`, of type **string** with a placeholder. When you click
Run Now, a small dialog asks for the URL before the agent fires.

To add an input field: in the left rail, click **+ Input field**,
pick a type (string, number, file, dropdown), and a key. Reference it
from a step config as `{{input.<key>}}`.

## Saving

Most fields auto-save on blur. The trigger config has an explicit
**Save trigger** button because it can affect the whole scheduler.
The agent name auto-saves the moment you click out of the field.

If you make a series of changes and want to verify they took, the
header briefly flashes a green checkmark on each successful save.

## See also

- [Step reference](step-reference.md) — every step type
- [Scheduling & triggers](scheduling.md) — cron, events, edge cases
- [AI Author](ai-author.md) — describe an agent in English, the
  builder generates it
