# AI Author — describe an agent in English

**AI Author** is the natural-language entry point for building agents.
You describe what you want in plain English; AI Author generates a
complete workflow (trigger + steps + prompts) ready to run.

## Where to find it

**AI Agents → Gallery → "AI Author" button** (sparkles icon, top-right
of the page header next to **+ New Agent**).

## The dialog

```
┌──────────────────────────────────────────────────────┐
│  Describe what you want to automate                  │
│                                                      │
│  [ multi-line text area, ~5 rows ]                   │
│                                                      │
│  e.g. Every weekday at 8 AM, check my Gmail for      │
│  unread messages, summarize the most important       │
│  ones, and email me a digest.                        │
│                                                      │
│           [ Cancel ]  [ ✨ Generate ]                │
└──────────────────────────────────────────────────────┘
```

Type a description that includes:

- **When** to run (manual / schedule / event-triggered)
- **What** to do (read, summarize, classify, send, save, etc.)
- **Where** the output goes (email me, write to a Sheet, save to
  Notes, just show a notification, etc.)
- **Any specifics** (which Gmail account, which calendar, which file
  folder)

The more specific the description, the closer the generated workflow
is to ready-to-run. Vague descriptions still work but you'll have
more to fill in afterward.

## Examples that work well

- "Every Monday at 7 AM, summarize what I worked on last week from my
  Notes widget and email me a Markdown digest."
- "Whenever a PDF lands in `~/Downloads/Inbound`, transcribe it via
  Claude vision OCR, save the text to `~/Documents/Transcripts`, and
  show me a notification."
- "Once a day at noon, fetch the top 10 posts from r/MachineLearning,
  summarize each in two sentences, and append them to my Notes."
- "Whenever I get a new email from anyone in my contacts that contains
  the word 'invoice,' save the attachment to Drive and log a row to
  my Receipts sheet."
- "Every weekday at 8 AM, look at my calendar for the day, and for
  each meeting that's scheduled, generate a one-paragraph prep brief
  using the meeting subject and any notes attached."

## What AI Author actually does

When you click **Generate**, the desktop:

1. Sends your description + the workflow step registry (every step
   type and its schema) to your default AI provider (Claude, by
   default; configurable in Settings).
2. The model returns a complete workflow JSON — trigger, steps, step
   configurations, prompts.
3. The desktop validates the JSON against the step registry's
   schemas. Invalid references or unknown step types cause a
   regeneration with a corrective prompt (up to 2 retries).
4. The validated workflow is imported into **My Agents** and the
   builder opens with it loaded.

Time to generate: typically 5–15 seconds. Cost: ~5–8¢ per generation
on Claude (one model call with structured output).

## What you should review after generating

AI Author is good but not perfect. Always check:

- **Trigger** — did it pick the right schedule / event? If not, edit.
- **Step configurations** — are the prompts what you want? Often the
  generated prompts are 80% there and benefit from a tweak.
- **Recipient / destination addresses** — AI Author sometimes uses
  placeholders (`me@example.com`) when you didn't specify; replace
  before activating.
- **API keys / connections** — if a step needs a Gmail account or a
  Sheets file, the field will be unset and shown with a red icon;
  fill it in.

The agent does **not** auto-activate. You decide when it's ready and
flip the **Active** toggle.

## Re-generating with edits

If the first generation isn't quite right, you can:

- **Refine and regenerate** — close the agent (delete it), reopen AI
  Author, and write a more specific description.
- **Edit in the builder** — for small adjustments, just edit the
  generated agent directly. The builder is the canonical editor;
  AI Author is just a head start.

There's no "regenerate from this agent" button currently.

## Privacy

Your description is sent to whichever AI provider you've set as the
default in Settings. Belief Genome's servers don't see it. The
description and the generated workflow JSON are stored locally only.
