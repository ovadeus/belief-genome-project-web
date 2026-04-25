# Connecting Google (Gmail + Calendar)

The Google integration covers both **Gmail** (read inbox, send, move,
tag, search) and **Google Calendar** (read events, create events).
Both are unlocked by the same OAuth credential.

This is a one-time setup that takes ~5–10 minutes. After that,
connecting additional Google accounts is a single click each.

## What you need

- A Google account that will own the OAuth app (your personal Gmail
  is fine)
- ~5 minutes for first-time setup, ~30 seconds per account thereafter

## Step 1 — Create a Google Cloud project

1. Open **[console.cloud.google.com](https://console.cloud.google.com)**
2. Top-bar project dropdown → **New Project**
3. Name it anything (e.g. "BGP Mission Control"). Leave organization
   as "No organization."
4. **Create**.

## Step 2 — Enable Gmail and Calendar APIs

These APIs are off by default. You enable them per-project:

1. With your new project selected, top-left hamburger → **APIs &
   Services** → **Library**.
2. Search **Gmail API** → click → **Enable**.
3. Back to Library, search **Google Calendar API** → click →
   **Enable**.

If you skip this step, OAuth consent will succeed but actual API
calls will fail with `Gmail API has not been used in project N
before or it is disabled.`

## Step 3 — Configure the consent screen

In the new **Google Auth Platform** UI (the redesigned OAuth
console):

1. Sidebar → **Branding**
   - App name: anything (e.g. "BGP Mission Control")
   - User support email: your email
   - Developer contact email: your email
   - **Save**

2. Sidebar → **Audience**
   - User type: **External**
   - In **Test users**, click **+ Add users** and add every Gmail
     address you'll connect from the desktop. Save.

3. Sidebar → **Data Access**
   - Add scopes (search by name, all under the Gmail / Calendar APIs):
     - `gmail.readonly`
     - `gmail.modify`
     - `gmail.send`
     - `calendar.readonly`
     - `calendar.events`
   - Save.

## Step 4 — Create the OAuth client

1. Sidebar → **Clients** → **+ Create Client** (or "Add Client")
2. Application type: **Desktop app**
3. Name: anything (e.g. "BGP Mission Control Desktop")
4. **Create**

A modal pops up with:

- **Client ID** — long string ending in `.apps.googleusercontent.com`
- **Client Secret** — starts with `GOCSPX-`

Copy both. (You can re-view them later by clicking the credential
row in the Clients list.)

## Step 5 — Paste into BGP Mission Control

1. Open the desktop's **Settings** (gear icon, bottom-left of the
   sidebar)
2. Scroll to **Email Integration** → **Google (Gmail + Calendar)**
3. Paste **Client ID** into the first field
4. Paste **Client Secret** into the second field
5. **Save** at the bottom of Settings

## Step 6 — Connect your first Gmail account

1. Still in Settings → Email Integration, click **+ Connect Gmail**
2. Your default browser opens to Google's sign-in
3. Sign in with the Google account you want to connect
4. Click **Continue** through the consent flow, then **Allow** on
   the scopes screen
5. The browser navigates to a localhost URL and shows "✅ Gmail
   Connected!" — you can close that tab
6. Back in Settings, the **Connected Accounts** list updates with the
   email and a green **Connected** badge

To connect a second account, click **+ Connect Gmail** again and
sign in with a different Google account in the OAuth flow. The
same Client ID/Secret works for any number of accounts.

## Limitations of "Testing" mode

While your OAuth app is in **Testing** status (the default for
unverified apps):

- Up to 100 test users allowed
- Each test user must be explicitly added in the Audience screen
- **Refresh tokens expire every 7 days.** You'll need to reconnect
  each Gmail account weekly.

To remove the 7-day expiry, **Publish** your app from the Branding
screen. For personal-use apps with sensitive scopes, Google may
request verification (provide a privacy policy URL, etc.). Most
personal users keep the app unpublished and accept the weekly
reconnect.

## Removing an account

In Settings → Connected Accounts, click **Remove** next to the
account. The desktop deletes the locally-stored tokens. The OAuth
grant on Google's side remains until you revoke it from
**[myaccount.google.com/permissions](https://myaccount.google.com/permissions)**.

## Common errors

See [Reconnecting Gmail](../10-troubleshooting/reconnect-gmail.md)
for the full list, but the headline ones:

- **"Access blocked: app has not completed verification"** — you're
  not in Test users. Add your email in Audience → Test users and
  retry.
- **"Gmail API has not been used in project … before or it is
  disabled"** — you skipped Step 2. Enable Gmail API.
- **"Reconnect required" badge** — the 7-day refresh-token expiry
  hit. Remove and re-Connect that account.
