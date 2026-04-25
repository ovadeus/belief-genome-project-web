# zBinder

**zBinder** is the Belief Genome project's notebook service —
a place to save notes, transcripts, and research that's
organized by notebooks and chapters. The desktop integrates so
agents can save output directly there, and so the Notes widget
can publish to zBinder.

## Configuring

**Settings → Integrations → zBinder**:

- **API key** — get one from your zBinder account at
  zbinder.io → Settings → API. Paste here.
- **Default notebook** — pick from the dropdown (populates after
  the API key is saved and the connection succeeds)

After saving, the sidebar status indicator shows a green
**zBinder** dot if reachable.

## Test connection

Click **Test connection** in Settings → Integrations → zBinder.
The desktop hits zBinder's `/notebooks` endpoint with your key
and confirms the response. You'll see one of:
- ✓ `Connected · N notebooks accessible`
- ✗ `Authentication failed — check your API key`
- ✗ `Network error — couldn't reach zbinder.io`

## What workflows can do with zBinder

Steps in the **`zbinder`** category:

- `zbinder.create-note` — given title + body + notebook ID, creates
  a new note
- `zbinder.search` — full-text search across all your notes,
  returns matching note IDs and snippets
- `zbinder.get-chapter` — fetch a specific chapter by ID
- `zbinder.list-notes` — list notes in a notebook (paginated)

These are the same primitives that the
[Anthropic skills `notes.create_note` / `notes.search`] expose,
which means workflows you write to use Anthropic's note skill on
the API can be ported to use zBinder via these steps.

## Removing the integration

Set the API key to empty and Save. The desktop forgets the
credential; nothing is deleted from your zBinder account.

## What if I'm not a zBinder user?

Skip this section. zBinder isn't required by any default feature.
If you don't have an account, the connection-status panel just
shows zBinder with a red dot, which is fine.
