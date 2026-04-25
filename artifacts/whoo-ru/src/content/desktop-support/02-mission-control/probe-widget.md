# The probe widget

The thin always-visible bar at the bottom of every page is the **probe
widget**. Each probe is a single belief statement; you slide between
"False" and "True" to register your position, optionally type a note,
and submit. One submission contributes to a dimension on your Belief
DNA.

It's deliberately small and persistent so you can answer one in 5
seconds without leaving whatever you're working on.

## Anatomy

From left to right:

- **Category pill** — the category this probe belongs to (Politics,
  Society, Religion, etc.). Color-coded.
- **Probe text** — the statement you're being asked about. Click to
  expand if it's longer than one line.
- **Position label** — your live label (Uncertain, Leaning True, etc.)
  as you drag.
- **False ←—— slider ——→ True** — the 9-point belief spectrum. Red on
  the left, green at neutral, blue on the right.
- **Submit** — record your answer.
- **Skip** — dismiss this probe and load the next one.
- **Stats** (right edge) — your overall progress: probes answered,
  dimensions covered, average confidence.

## How a probe gets onto the bar

The bar is filled by the **probe scheduler**, which prioritizes:

1. **Active exploration sessions.** When you click an unexplored cell
   on the DNA strip, the scheduler queues 3–5 probes targeting that
   specific dimension and walks you through them.
2. **News-driven probes.** If "News probes" are enabled in Settings,
   the bar surfaces probes derived from articles your Research Pulse
   sources are publishing today.
3. **Backfill from the probe bank.** Otherwise, the next-most-useful
   probe from the local probe bank (124 dimensions × multiple variants
   per dimension).

The category pill changes color to match the current dimension's
category, so you always know what you're contributing to.

## Submitting a probe

1. Drag the slider, or click anywhere on the track, to set your
   position. The label updates live (Strongly False → Deeply False →
   False → Leaning False → Uncertain → Leaning True → True → Deeply
   True → Strongly True).
2. Optional: click the probe text to expand and add a written
   reflection. Reflections are stored alongside the score and surface
   later in the **History** tab and the **Lineage drawer**.
3. Click **Submit**. The bar advances to the next probe immediately;
   your answer logs in the background.

Average submission time: 4 seconds.

## Skipping

Click **Skip** if a probe doesn't apply to you, you don't have an
opinion yet, or it requires more thought than you have right now.
Skipped probes are logged separately (so the scheduler doesn't keep
re-queuing them) but **don't** count toward your DNA.

## Exploration mode

Click any explored or unexplored cell on the DNA strip on the **Belief
Genome → Belief DNA** page. For unexplored cells, an **EXPLORING**
badge appears above the probe bar showing which dimension you're
filling in and how many probes remain in the session. For explored
cells, the
[lineage drawer](../04-belief-genome/lineage-drawer.md) opens instead.

While exploration is active, the probe scheduler ignores other queues
and walks you through that one dimension until you exit (Esc, click
the strip again, or click the **Exit Exploration** badge).

## "Where does my answer actually go?"

A submission writes to three places:

1. **Belief responses log** — the raw record (probe text, category,
   value, note, timestamp). Used by the History panel.
2. **Dimension scores** — the per-dimension running confidence-weighted
   average that powers the DNA strip and all visualizations.
3. **Lineage** — a per-response trace of what that answer changed in
   each dimension's score, so the lineage drawer can show your full
   answer history and how each dimension drifted over time.

If you've connected your web account, the response also batches up to
the web for cross-device syncing (every few minutes; you can force it
via Settings → Belief Genome account → **Sync now**).

## Hiding the bar

There's no "hide probe bar" option — it's intentional that the bar is
always reachable. Pressing **Esc** while focused on the slider will
move focus elsewhere, and the bar fades to ~80% opacity when idle, but
it doesn't dismiss.

## Why some probes have a green "Generate" badge

That badge means the probe was created by the **Generate Probe**
workflow (an AI agent that derives probes from your recent reflections
or from world events). They're treated identically to bank probes —
the badge is purely informational so you know it's not curriculum.
