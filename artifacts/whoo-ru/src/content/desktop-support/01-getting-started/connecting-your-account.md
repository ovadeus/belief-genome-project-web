# Connecting your Belief Genome web account

The desktop and the web companion at **beliefgenomeproject.org** are two
sides of the same Belief Genome account. Connecting them lets your DNA,
reflections, and probe history sync automatically. You can use the
desktop without connecting (it has its own local belief data store), but
several features require it.

## What changes when you connect

| Feature | Local-only | Connected |
|---|---|---|
| Take a probe / log a reflection | ✓ | ✓ |
| Build local DNA strip | ✓ | ✓ |
| Run AI agents | ✓ | ✓ |
| Web Evolution timeline | ✗ | ✓ — pulls bucketed history from the web |
| DNA Compare with friends | ✗ | ✓ — sends an anonymized snapshot to the compare endpoint |
| Multi-device sync | ✗ | ✓ — answer a probe on the web, see it on desktop |
| Web reflections imported | ✗ | ✓ |

## How to connect

The simplest path is during onboarding (see
[First launch](first-launch.md)). To connect later:

1. Open **Settings** (gear icon, bottom-left of the sidebar)
2. Scroll to **Belief Genome account**
3. Paste your **Bearer token** into the **Genome Auth Token** field
4. Optional: paste a custom API base URL if you're running against a
   self-hosted Belief Genome instance (default is
   `https://beliefgenomeproject.org`)
5. Click **Save**

## Where to get the token

1. Sign into **beliefgenomeproject.org**
2. Click your avatar (top right) → **Settings** → **API access**
3. Click **Generate desktop token**
4. A long string starting with `bgp_` appears. Copy it now — you can't
   view it again, only regenerate.
5. Paste into the desktop's **Genome Auth Token** field

The token is stored locally only — it never leaves your machine except
when included as an `Authorization: Bearer …` header on calls to the
Belief Genome API.

## Verifying the connection

After saving, click the small **Test connection** button next to the
field. The desktop hits `/api/genome/timeline` once. You'll see one of:

- **green checkmark** — connected
- **"Session expired"** — token was revoked or has expired; regenerate
  on the web
- **"Network error"** — local connectivity issue; try again on a
  working network

The same connection is exercised by the **Evolution** panel under Belief
Genome, the **DNA Compare** tab, and the daily background sync.

## Sign out

Settings → Reset Account → **Sign out of this device**. This clears:
- Your auth token
- The cached email address from your web profile
- The "onboarding complete" flag (so you'll see the welcome flow again
  next launch)

It does **not** delete:
- Your local belief responses, memories, or probe history
- Your AI provider keys
- Any connected Gmail / Outlook / etc. integrations

If you want to wipe everything, see
[Full reset](../11-privacy-and-data/reset.md).

## Connecting multiple devices to the same account

Yes, supported. Generate one token per device on the web (each gets a
unique device label), and paste each into its own machine. All devices
sync to the same web account; reflections logged anywhere appear
everywhere.
