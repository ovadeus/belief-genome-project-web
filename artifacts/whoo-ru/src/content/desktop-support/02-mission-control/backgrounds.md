# Backgrounds

Mission Control's full-window background image is part of the ambient
feel. The default cycles photos from Unsplash; you can swap to a
specific source or turn it off.

## Refreshing the current background

Click the looping-arrow icon in the dashboard page header (top right).
A new photo loads with a 1.2 s crossfade. Same source, just a fresh
image.

## Choosing a source

**Settings → Display → Background source:**

| Source | What it does |
|---|---|
| **Unsplash (default)** | Random photos curated from a Belief Genome project list. Refreshed daily by default. |
| **Solid color** | Flat dark blue-black (`#080810`). Lowest distraction, lowest GPU. |
| **Custom folder** | Cycles through any folder of `.jpg`/`.png` files on your machine. |
| **Single image** | Pin one image as the permanent background. |

For **Custom folder**, click **Choose folder** and pick a directory
of images. The app cycles them at the same cadence as Unsplash.
Subfolders are scanned recursively.

## Photo credit

When using Unsplash, the photographer's name and a link to their
Unsplash profile appear in the bottom-left corner of the sidebar
("Photo by Jane Doe on Unsplash"). This is required by Unsplash's
attribution policy. You can hide it via Settings → Display → "Show
photo credit" toggle, but please don't if you're publishing
screenshots — give the photographer credit.

## Disabling backgrounds entirely

Set Background source to **Solid color**. This is also the right
choice if you're on battery and want to minimize GPU draw — Unsplash
images are decoded each cycle and the crossfade animation runs on the
compositor.

## Mini mode

When the app is in **mini mode** (the floating dock-tab UI), the
background image is hidden — mini mode uses just the helix logo and
status indicators. The full background returns when you expand back
to the dashboard window.

## Programmatic background changes (workflows)

The "Set Background" workflow step lets an agent change the
dashboard's background based on time of day, weather, or any other
trigger. See [Workflow steps](../03-ai-agents/step-reference.md).
