# Reconnecting Gmail (or Outlook)

The most common integration issue: Settings shows your account as
**Reconnect required** (red badge), or the Inbox Summary widget
flashes `auth error`, or an Important Dates "Send test now" comes
back with `Gmail authentication expired.`

This page covers what's happening and the 60-second fix.

## What "Reconnect required" means

Your account record is still in the local store, but the OAuth
**access token** has expired and the **refresh token** isn't
available to mint a new one. Without a valid token the desktop
can't make any Gmail API calls.

This is **not** a bug in the desktop — it's the OAuth lifecycle
working as designed. Tokens expire; sometimes refresh tokens get
invalidated and need a fresh consent flow.

## Why it usually happens

| Cause | Fix |
|---|---|
| **Test-mode 7-day expiry** (Google) | Re-Connect the account; or publish your OAuth app |
| You revoked the app's grant on Google's side | Re-Connect — fresh tokens are issued automatically |
| You changed your Google password recently | Re-Connect; some events invalidate refresh tokens |
| Sync moved your config from another machine without tokens | Re-Connect on the new machine |
| The Gmail / Calendar API got disabled on your project | Re-enable in Cloud Console, then Re-Connect |

## The fix

1. **Settings → Email Integration → Connected Accounts**
2. Click **Remove** next to the affected account
3. Click **+ Connect Gmail** (or Outlook) at the bottom
4. Sign in with the same Google account in the OAuth flow
5. Click Continue → Allow on the consent screens
6. Browser tab shows "✅ Gmail Connected!" — close it
7. Back in the desktop, the account reappears with a green
   **Connected** badge

That's it. Total time ~30 seconds.

## After reconnecting

- The Inbox Summary widget's red `auth error` line clears on the
  next "Run Now"
- Important Dates entries with `_lastSendError` keep their red
  badge until the next successful send (test or real); click
  "Send test now" in the edit modal to clear
- Background workflows that were failing on this account will
  resume on their next scheduled tick

## How to avoid the 7-day Test-mode expiry

Google's OAuth Testing status caps refresh tokens at 7 days. To
get the standard 6-month expiry:

1. Open **[console.cloud.google.com → OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)**
2. Click **Publish app**
3. Confirm — your app moves to "In production" status
4. For sensitive scopes (Gmail, Calendar) Google may ask for
   verification (privacy policy URL, security review). For
   personal-use apps with no public footprint, you can usually
   stay in "In production" without verification — Google just
   shows users an "unverified app" warning when consenting.

The verification process varies but is well-documented:
[support.google.com/cloud/answer/13463073](https://support.google.com/cloud/answer/13463073)

## "Why are there THREE different messages about my Gmail?"

You may have noticed conflicting status reports across:
- Settings → Connected Accounts ("Connected" / "Reconnect required")
- Inbox Summary widget (`auth error` if API call returned 401)
- Important Dates → Send test now (specific failure text)

As of v0.1.0+, all three surfaces share the same auth-status
classifier and should agree. If they don't, that's a bug —
please file a report with screenshots of all three.

## Prior versions: what was wrong before

In earlier builds, `gmailFetcher.getConnectedAccounts` was called
incorrectly, which made certain code paths report "no account" even
when records existed. That bug is fixed; if you're seeing the
inconsistency, you're on an older build — update.

## Removing tokens completely

Removing an account in Settings deletes only the local tokens. The
OAuth grant on Google's side is still active. To fully revoke:

1. Go to [myaccount.google.com/permissions](https://myaccount.google.com/permissions)
2. Find "BGP Mission Control" (or whatever you named your OAuth app)
3. Click **Remove access**

After full revocation, even if you re-Connect from the desktop,
Google will show the consent screen fresh because there's no prior
grant to leverage.
