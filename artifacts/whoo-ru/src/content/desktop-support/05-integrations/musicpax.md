# MusicPax

**MusicPax** is the Belief Genome project's music service — a
local-first music library with playback, search, playlist
organization, and shareable "pax" (curated mixes). The desktop
integrates so the **MusicPax** widget can browse and play, and so
workflows can reach into your library.

## Configuring

**Settings → Integrations → MusicPax**:

- **MusicPax server URL** — usually `http://127.0.0.1:7766` if
  you're running MusicPax locally. For a remote server, use
  `https://your-server.example.com`.
- **Auth token** — copy from MusicPax's `Settings → API` page.
- **Default device** — select from the dropdown (populates after
  the URL + token are saved)

Click **Save**. The sidebar status indicator shows a green
**MusicPax** dot when reachable.

## Test connection

Click **Test connection**. The desktop hits `<server>/healthz`
with the auth token. Possible results:

- ✓ `Connected · MusicPax v0.x.x`
- ✗ `Cannot reach server — check URL`
- ✗ `Auth rejected — check token`

## What the widget does

The **MusicPax widget** on Mission Control shows:

- Currently playing (track, artist, album art if available)
- Play / pause / skip controls
- A search bar that hits MusicPax's `/musicpax/search` endpoint
- A queue view (collapsible)
- A pax browser to switch between curated mixes

## What workflows can do

Steps in the **`musicpax`** category:

- `musicpax.search` — text search; returns matching tracks
- `musicpax.play` — play a track or pax by ID
- `musicpax.queue-add` — append a track to the current queue
- `musicpax.now-playing` — read the current playback state
- `musicpax.skip` — skip to the next track

A common pattern: a "Morning Routine" workflow that runs at 7 AM,
checks weather, and plays a different pax depending on conditions
(rain → "Reflective Acoustic," sunny → "Bright Pop").

## Self-hosted vs hosted

MusicPax can run as:
- **Local self-hosted** — installs alongside your music library on
  the same machine; the desktop talks to `127.0.0.1`.
- **Hosted** — accessed via a `https://` URL. Useful when your
  music library is on a NAS or cloud server.

Either way the integration works the same — only the URL differs.

## Removing the integration

Clear the URL and token, then Save. The widget will show "Not
connected" but still appear in the dashboard until you remove it
via Organize mode.

## What if I'm not a MusicPax user?

Same as zBinder — skip this section. The MusicPax widget defaults
to "Not connected" with no impact on the rest of the app.
