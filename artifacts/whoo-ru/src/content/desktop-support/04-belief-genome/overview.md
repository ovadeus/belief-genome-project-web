# Belief Genome — overview

The **Belief Genome** page (sidebar tab) is the visualization-rich
exploration of your DNA. It complements the always-on probe widget at
the bottom of every page: probes input data; this page lets you see,
slice, and interrogate the result.

## Layout

A standard page header with stats follows by a row of **viz tabs**:

| Tab | Visualization |
|---|---|
| Belief DNA | The 124-cell DNA strip (rows × columns) |
| Triple Helix | Animated 3D helix of your strongest leans |
| Neuromap | 3D brain model colored by your dimension scores |
| Radar | 9-axis radar chart of category centroids |
| Breakdown | Categorical bar chart with mini-meters |
| Timeline | Time-series of your responses |
| Evolution | Cross-device timeline pulled from the web account |
| History | Searchable list of every response you've ever made |
| Forecaster | "How would I answer this probe?" prediction tool |
| Compare | Compare your DNA with friends |

Below the tab row sits the active panel. Clicking any tab swaps the
panel without leaving the page.

## Stats row (top)

Five always-visible cards at the top:

- **Responses** — total probes you've answered
- **Categories** — how many of the 11 you've touched
- **Day Streak** — consecutive days with at least one response
- **News Probes** — probes that originated from news content
- **Avg Agreement** — your average alignment to the "True" pole
  across all answers (50% is perfectly balanced)

These come from the same local data that drives the visualizations.
On a fresh install they all read 0; they update in real time as you
answer probes.

## DNA serial

At the top of the Belief DNA panel (and in several other places like
the Evolution panel's "DNA Snapshot") is your **DNA serial** — a
140-character string. The first 16 characters are your **demographic
prefix** (a stable hash of your declared demographics); the next 124
are one digit per dimension on the 0–9 scale, with `·` for unexplored
dimensions.

The serial is meant to be human-shareable: short enough to fit in a
tweet, dense enough to fully reconstruct your DNA on the web's
**Compare** tool.

## Where to go next

- **The strip itself** → [Belief DNA strip](dna-strip.md)
- **All 8 visualization tabs explained** → [Visualizations reference](visualizations.md)
- **Click an explored cell** → [Lineage drawer](lineage-drawer.md)
- **Type B-G-P somewhere on the dashboard** →
  [Harmonize DNA Easter egg](harmonize.md)
- **The 9-point belief scale** → [Belief scale](belief-scale.md)
