# Belief Genome visualizations

Eight tabs across the top of the Belief Genome page — each is a
different lens on the same underlying DNA data. Quick reference for
what each shows and when to use it.

## Belief DNA

The canonical strip view. See [DNA strip](dna-strip.md).

**Use when:** you want the full overview at a glance, or want to drill
into a specific dimension via the lineage drawer.

## Triple Helix

Animated 3D double-helix where each pair of base "rungs" is a
dimension; the rung's tilt encodes your score, color encodes the
9-point bucket. Rotate by dragging; auto-rotates when idle.

**Use when:** you want a visceral, beautiful overview to share or
contemplate. The helix isn't useful for inspection — it's atmospheric.

Click any rung to highlight it in the legend; the legend tag shows
the dimension name and your label.

## Neuromap

A 3D human brain model with regions colored by your dimension scores.
Specific dimensions are mapped to specific brain regions based on a
neuroscience taxonomy of belief-related cognition (e.g. "moral
reasoning" highlights ventromedial PFC; "spatial cognition" highlights
parietal cortex).

**Use when:** you want a popular-science representation that connects
your DNA to brain function. Not clinically meaningful — it's a
storytelling visualization, not a neuroimaging tool.

The Neuromap loads in an iframe (the brain model is its own
self-contained HTML/Three.js page). On first open it may take 1–2
seconds to fetch the textures.

## Radar

9-axis radar chart. Each spoke is a category; your position on the
spoke encodes your category-average from the most-extreme-left pole
(center) to the most-extreme-right pole (edge). Each spoke shows:

- Bold category name
- Lighter "LeftPole ↔ RightPole" axis label
- 9-segment LED meter beneath, with the active segment glowing in
  its gradient color

**Use when:** you want to see your overall ideological shape —
which categories pull left, which pull right, where you sit in the
middle.

A dashed green ring at value 50 marks the neutral reference; vertex
points are colored by the same 9-step gradient. The insight panel
below the chart calls out your three strongest leans.

## Breakdown

A clean horizontal-bar layout: one row per category showing the count
of explored dimensions, the centroid score (numeric), and a small
spectrum bar. Easier to read than the radar when you want to compare
specific values numerically.

**Use when:** you're looking for hard numbers, not the visual
silhouette.

## Timeline

Time-series chart of all your raw responses. X-axis is time; Y-axis
is value (0–100). Dots colored by the 9-step gradient. Hover any dot
for the probe text and your answer.

**Use when:** you want to see how a specific period of your life
trended, or spot times when you were answering more "extremely" vs
more uncertainly.

A toggle row above the chart filters by category — useful when there
are many points and you want to see just one category's trajectory.

## Evolution

**Requires connected web account.** Cross-device, time-bucketed
timeline. Y-axis shows confidence % and dimensions covered as twin
lines; below it, 11 category sparklines colored by current score; at
the bottom, a DNA Snapshot scrubber that lets you scrub through
historical buckets and see how your DNA looked on a specific day /
week / month.

**Use when:** you want long-form trends including data you logged
on other devices.

The Day / Week / Month / Auto buttons in the top-right pick the
bucket size. Auto chooses by date range — daily for short ranges,
weekly for longer, monthly for yearlong views.

## History

A searchable, paginated list of every response you've ever logged.
Each row: probe text, your answer (with the colored value label),
your written note (if any), category, source ("news:..." vs
"bank:..."), timestamp, and a confidence dot.

**Use when:** you want to find a specific response, audit your past
answers, or filter to a particular probe / source.

Filters: search bar (matches probe text + note text), category
dropdown, source dropdown, date range. Click any row to expand and
see full details / re-answer.

## Forecaster

A "predict your own answer" tool. Type a hypothetical probe statement;
the AI uses your existing DNA + reflection patterns to predict where
you'd score it on the 0–100 scale, with a confidence band and a
reasoning trace.

**Use when:** you want to understand your own DNA's predictive
power, or want to think through a question before answering it
"officially" via a real probe.

After the prediction renders, a slider lets you record what you
*actually* think — your correction logs as a real response with the
probe text intact, contributing to your DNA going forward.

## Compare (sub-tab on the page)

**Requires connected web account.** Compare your DNA with friends
who have shared a comparison key, or with public archetypes
("Average Stoic," "Average libertarian," etc.). Side-by-side strip
view with a "delta heatmap" highlighting where you differ most.

**Use when:** you want to see how you compare to someone specific
(after exchanging keys) or where your DNA sits relative to common
archetypes.

## Fullscreen for any visualization

Each viz panel has an **expand** icon in the top-right that opens a
fullscreen overlay. Press **Esc** to exit. Useful for sharing
screenshots or for high-density inspection on small windows.
