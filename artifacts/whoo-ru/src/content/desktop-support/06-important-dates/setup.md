# Setting up Important Dates

The **Important Dates** widget on Mission Control tracks birthdays,
anniversaries, holidays, and any other recurring or one-off dates
you care about. Each entry can optionally **send an email reminder**
on the date itself — a personal touch a calendar reminder can't
match.

## Adding a date

In the widget header, click **+** to open the inline add row, or
click **+ Add date** if the widget is empty.

Required fields:
- **Title** — the person's name or event label (e.g. "Mom's
  Birthday")
- **Date** — the original date (YYYY-MM-DD)

Optional:
- **Type** — Birthday / Anniversary / Holiday / Other (changes the
  emoji icon and the email subject template)
- **Repeats annually** — for recurring events; the widget will
  show the next occurrence each year

Click **Add**. The entry appears sorted by next occurrence
(soonest first).

## Editing a date

Click the **pencil** icon in any row to open the **Edit Important
Date** modal. The full editor has all the fields above plus the
email-reminder section.

## Setting up an email reminder

In the edit modal, scroll to **Email Reminder (optional)**:

1. **Message** — the body of the email to send. Keep it personal —
   this isn't an automated-feeling notice, it's a personal message
   on a special day.
2. **Recipient's Email** — the address to send to. Usually the
   person whose birthday/anniversary it is, but it could be
   anyone (e.g. yourself, as a "remember to call Mom" note).
3. **Send this email on the date** — toggle ON to arm the reminder.

Click **Save**.

If you save with the toggle ON but recipient or message empty, the
modal warns "Add a recipient and message to send on this date."

## Required: a connected Gmail account

Email reminders use your **connected Gmail account** to send. If
you don't have Gmail connected, the modal shows a warning hint
under the "Send this email" toggle: **"No Gmail account connected
yet. Connect one in Settings → Email Integration."**

See [Connecting Google](../05-integrations/google.md) for the
Gmail setup walkthrough.

## When the email actually fires

The desktop runs a **daily checker** that:

- Loads all Important Date entries
- For each entry with `sendEmail: true`, recipient, and message:
  - Computes today's calendar date (local TZ)
  - Compares against the entry's date (recurring: month+day match;
    one-off: full Y/M/D match)
  - On match, sends the email and stamps `_lastSentDate` on the
    entry so it doesn't double-send

The checker runs:
- **At app startup** (8 seconds after launch, to give OAuth
  tokens time to refresh)
- **Every 6 hours** while the app is running

So if your Mac was closed all day on the 23rd, no reminder fires
that day. The reminder is **not** retried the next day — once the
date passes, that year is done.

If you need always-on reliability regardless of whether the app is
open, see [Background workflows](../03-ai-agents/background-workflows.md)
— you can build a scheduled workflow that mirrors this behavior
and runs via launchd / Task Scheduler.

## Sending a test now

The edit modal has a **Send test now** button below the email
reminder section. Click it to fire a one-off email immediately
using the entry's currently-saved recipient and message. The
status row shows `Sending… → ✓ Sent to <address>` or `✗ <error>`
inline.

A test send:
- Doesn't update `_lastSentDate` (so the real reminder still fires
  on the date)
- Doesn't create any history entry
- Is the fastest way to verify recipient/message/auth work end-to-end

## What the recipient sees

| Type | Subject | Body |
|---|---|---|
| Birthday | "Happy Birthday, <Title>!" | Your message, formatted as HTML |
| Anniversary | "Happy Anniversary — <Title>" | Your message, formatted as HTML |
| Holiday | "<Title>" | Your message, formatted as HTML |
| Other | "<Title>" | Your message, formatted as HTML |

The "From" line is whichever connected Gmail account is used
(currently the first one in your Connected Accounts list — we'll
expose a dropdown to pick a specific one in a future release).

## See also

- [Why my reminder didn't send](troubleshooting.md)
- [Connecting Google (Gmail)](../05-integrations/google.md)
- [Important Dates widget reference](../02-mission-control/widgets.md#important-dates)
