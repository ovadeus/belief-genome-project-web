# Connecting Microsoft (Outlook + Calendar)

The Microsoft integration covers **Outlook mail** and **Outlook
Calendar**. Like Google, both are unlocked with a single OAuth client
that you register once in the Azure Portal.

## What you need

- A free Microsoft account (work, school, or personal — any will do)
- ~5 minutes for first-time setup

## Step 1 — Register an app in Azure Portal

1. Open **[Azure Portal → App registrations](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)**
   (sign in with the Microsoft account that will own the registration)
2. Click **+ New registration**
3. Fill in:
   - **Name:** "BGP Mission Control" (or any name)
   - **Supported account types:** Select **Accounts in any
     organizational directory and personal Microsoft accounts** (the
     widest option) so any Outlook address can sign in
   - **Redirect URI:** select **Public client/native (mobile &
     desktop)**, then enter `http://localhost` (any port — the
     desktop dynamically allocates one at runtime)
4. Click **Register**

You land on the new app's overview page.

## Step 2 — Get the Application (Client) ID

On the overview page, copy the **Application (client) ID** — a UUID
like `0fc3dabc-1234-5678-9abc-def012345678`.

That's it. You don't need a client secret for personal-use desktop
apps using PKCE flow (Microsoft calls these "public clients"). Leave
the secret field empty in Settings.

## Step 3 — Paste into BGP Mission Control

1. Settings (gear icon) → **Email Integration** → **Microsoft
   (Outlook + Calendar)**
2. Paste the Application ID into **Microsoft OAuth — Application
   (Client) ID**
3. Leave **Client Secret** empty (the placeholder says "Leave blank
   for public clients")
4. **Save**

## Step 4 — Connect your first Outlook account

1. Click **+ Connect Outlook**
2. Browser opens to Microsoft's sign-in
3. Sign in with the Outlook / Microsoft account you want to connect
4. Approve the requested permissions
5. Browser redirects to a localhost URL with a success page; close
   the tab
6. Back in Settings, the account appears in **Connected Accounts**
   with a green **Connected** badge

Repeat **+ Connect Outlook** for each additional Outlook account.

## When you'd want a Client Secret

You don't, for personal use. Client secrets are for **confidential
clients** — server-side apps where you can keep a secret on a
machine the user doesn't control. A desktop app distributed to
users is by definition a public client, and Microsoft's PKCE flow
provides equivalent security without a secret.

If you registered your app as confidential by accident (chose
"Web" as the platform instead of "Public client/native"), the
desktop will fail to authenticate. Re-register or change the
platform: in Azure Portal, App → **Manifest** → edit
`"allowPublicClient": true`.

## Token lifetime

Microsoft refresh tokens last **90 days** by default for personal
accounts, with rolling renewal — much friendlier than Google's
Testing-mode 7-day window. The desktop stores them locally and
silently refreshes the access token when it expires.

## Removing an account

Settings → Connected Accounts → **Remove**. Same as Gmail — the
local tokens are deleted; the grant on Microsoft's side remains
until you revoke from
**[account.microsoft.com/privacy/app-access](https://account.microsoft.com/privacy/app-access)**.

## What the desktop can do with Outlook

Mail:
- Read inbox messages and threads
- Search by query, label, date range, from/to
- Send new messages
- Move messages between folders
- Apply / remove categories (labels)

Calendar:
- Read events from connected calendars
- Create new events
- Update existing events
- Respond to invitations (accept/decline/tentative)

## Common errors

- **"AADSTS500113: No reply address registered"** — the redirect URI
  in your Azure app registration doesn't include `http://localhost`.
  Open the app in Azure Portal → Authentication → add
  `http://localhost` under Redirect URIs.
- **"AADSTS50194: Application not configured for personal accounts"**
  — Supported account types is set to "Single tenant" or
  "Multitenant" (org-only). Change to "Multitenant + personal
  Microsoft accounts."
- **"Confidential client cannot use public flow"** — your app is
  registered as confidential. Either supply the Client Secret or
  change the platform configuration.
