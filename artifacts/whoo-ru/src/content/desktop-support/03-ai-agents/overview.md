# AI Agents — overview

The **AI Agents** page (sidebar tab) is where you build and run
multi-step agents — workflows that chain together AI calls, email,
web fetches, file actions, and other steps to accomplish whole tasks
on your behalf.

The page has two views:

1. **Gallery (default)** — your saved agents on top, the template
   library below. This is where you start.
2. **Builder** — opens when you click into an agent. The full editor
   for steps, triggers, schedules, and run history.

## Gallery view

### My Agents

Agents you've cloned from a template, written from scratch, or
imported. Each card shows:
- An icon and name
- A short description
- The tool icons it uses (Gmail, Drive, X, etc.)
- Its trigger ("Manual," "Daily 8 AM," "On new email," etc.)
- An **ACTIVE** pill if it's currently enabled

Click any card to open the builder for that agent.

### Start from Template

24 prebuilt templates that cover common patterns:
- Daily Spam Cleanup
- Daily Unread Digest
- Email Receipt → Sheets
- AI News Aggregator
- Competitor Intelligence
- Meeting Prep Automation
- Morning Schedule Briefing
- PDF Transcribe
- YouTube Channel Analysis
- Weekly Project Report
- … etc.

Click any template card to clone it into **My Agents** as an editable
copy. The original template is preserved; your clone gets its own
configuration.

## How agents are structured

An agent is:

- A **trigger** (one) — what causes it to run
  - **Manual** — you click Run Now
  - **Schedule** — cron-like, e.g. "every weekday at 8 AM"
  - **Event** — fired by another part of the app (new email arrived, file
    changed in a watched folder, etc.)
- A list of **steps** (one to many) — each does one thing and passes its
  output to the next
- An optional **input schema** — fields the user fills in when running
  manually (used by templates like "Transcribe YouTube" that take a URL)
- An **output target** — where the final result lands (Notes widget,
  Media Library, an email, a Sheet, etc.)

## Running an agent

From the gallery, click an agent → builder opens → click **Run Now**
in the top-right. The right pane shows the live execution log: each
step's input, output, and timing. Errors are visible inline.

For schedule-triggered agents, **Active** must also be toggled on or
the schedule won't fire. Runs while Mission Control is closed require
the **Background** toggle (see
[Background workflows](background-workflows.md)).

## Run history

The **History** button in the builder toolbar opens the run-history
panel — every previous run for this agent with status, duration, and
collapsible step-by-step output. Click any run to expand its full log.

## Test runs

Click **Test Run** (the flask icon) to dry-run the agent without side
effects: AI calls go through normally, but write actions (sending
email, modifying files, creating events) are stubbed and the log
labels them `[DRY-RUN]`. Useful when you've just edited a step and
want to verify the prompt / config without firing real outbound
actions.

## Where to go next

- **Build from a template** → [Cloning a template](templates.md)
- **Build from scratch** → [The workflow builder](builder.md)
- **Use AI Author** to describe what you want in plain English →
  [AI Author](ai-author.md)
- **Schedule a workflow** → [Scheduling & triggers](scheduling.md)
- **Run while the app is closed** → [Background workflows](background-workflows.md)
- **See every step type available** → [Step reference](step-reference.md)
