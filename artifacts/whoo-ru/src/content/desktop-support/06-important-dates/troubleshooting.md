# Why my Important Dates reminder didn't send

If a date arrived and you didn't get the email, one of five things
went wrong. Walk through them in order.

## 1. The entry isn't actually armed for email

Open the edit modal for the entry. Verify all of:
- ✓ "Send this email on the date" toggle is **ON**
- ✓ "Recipient's Email" has a valid address
- ✓ "Message" has at least some content

The widget shows a small **mail icon** next to the title for any
entry that's armed. No icon = not armed. The daily checker silently
skips un-armed entries; this is by design (so you can keep birthday
entries in the widget without sending emails for all of them).

## 2. Gmail isn't actually connected

Open **Settings → Integrations → Connected Accounts**. Each Gmail
account should show a green **Connected** badge. If they show red
**Reconnect required**, the OAuth tokens are stale (most often
because of Test-mode 7-day expiry).

See [Reconnecting Gmail](../10-troubleshooting/reconnect-gmail.md).

You can verify the connection works by clicking **Send test now**
on the edit modal — that fires a real email. If it fails, the
inline error message is the same message that the daily checker
would log.

## 3. The app wasn't running on the date

The daily checker runs at app startup (+8s) and then every 6 hours
**while the app is running**. If your Mac was closed all day on the
target date, no reminder fires that day — and importantly, it
won't retry the next day either, because by then the calendar
match is gone.

If always-on reliability matters to you, two options:

- **Leave the app open.** The desktop sleeps cheaply when minimized.
- **Set up a background workflow.** Build a scheduled workflow
  (cron: `0 9 * * *` for daily 9 AM) that loops through your
  Important Dates and sends matches. Toggle Background on so it
  fires via launchd / Task Scheduler regardless of whether the app
  is open. See [Background workflows](../03-ai-agents/background-workflows.md).

## 4. The send failed silently

When the daily checker runs and a send fails, the desktop:
- Logs the error to console (visible in DevTools, not normally seen)
- Stamps `_lastSendError` on the entry with the error message
- Adds a **red badge** next to the entry's title in the widget
- Does NOT stamp `_lastSentDate` (so a fix-and-retry next run will work)

If you see a red error badge, hover it for the failure message.
Common ones:

- *"No Gmail account connected"* → connect Gmail
- *"Gmail authentication expired"* → reconnect (Test-mode 7-day
  expiry hit)
- *"Quota exceeded"* → Gmail's send limit; wait an hour
- *"Recipient address invalid"* → typo in the email address; edit and
  retry

The edit modal also surfaces the persisted error in a red banner
labeled **"Last send failed"** with timestamp and full text.

## 5. The recipient's mailbox bounced or filtered it

If the desktop says it sent successfully but the recipient never
saw the email:

- **Check their spam folder.** Personal-feeling emails sent via
  OAuth can sometimes get caught in aggressive filters.
- **Check the sent folder of your sending Gmail account.** If it's
  there, the desktop's send succeeded — the issue is downstream
  (delivery, filtering, recipient-side block).
- **Look for a bounce notification** in your sent account.
- **Send to yourself first** as a sanity check: change the recipient
  to your own address, click Send test now, confirm you receive it.
  If yes, the issue is the recipient's side.

## Verifying the daily checker is working

Open the desktop and watch the Settings → Diagnostics page (or
DevTools console). You'll see log lines like:

- `[importantDates] Sent "Mom's Birthday" reminder to mom@example.com`
- `[importantDates] No Gmail account connected — cannot send reminder for "X"`
- `[importantDates] Send failed for "X": <error>`

You can also force a check by clicking the gear icon → opening
DevTools (⌘⌥I) and running:

```js
await window.mc.importantDates.runCheck()
```

This is what the **Send test now** button does for a single entry.

## "I want to test that today's date triggers"

Edit any entry to today's date, save, then trigger a check (close
and reopen the app, or run the IPC above). The reminder should send
within seconds. After verifying, change the date back.

## What `_lastSentDate` does

Once a reminder sends successfully, the desktop stamps the entry
with `_lastSentDate: '2026-04-25'`. If the checker runs again the
same day (it runs every 6 hours), the entry is skipped because
`_lastSentDate === todayIso`. This dedupes within a calendar day.

The next year, the date string differs from `_lastSentDate`, so the
reminder fires again as expected.

If you ever want to force a re-send on the same day, edit the
entry: changing the date, message, or recipient resets
`_lastSentDate` to null automatically.
