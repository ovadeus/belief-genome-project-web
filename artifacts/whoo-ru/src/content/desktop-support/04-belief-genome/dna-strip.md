# The Belief DNA strip

The **Belief DNA** tab on the Belief Genome page is the canonical
view of your DNA: 124 cells laid out in 11 category rows, each cell
representing one dimension of your belief profile.

## Layout

```
EPISTEMOLOGY     ▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮     11/11
SPIRITUALITY     ▮▮▮▮▮▮▮▮▮▮          8/10
MORALITY         ▮▮▮▮▮▮▮▮▮▮▮▮▮▮      14/14
POLITICS         ▮▮▮▮▮▮▮▮▮▮▮▮         12/12
SOCIAL           ▮▮▮▮▮▮▮▮▮▮▮          11/11
ECONOMICS        ▮▮▮▮▮▮▮▮▮▮▮          11/11
SCIENCE & TECH   ▮▮▮▮▮▮▮▮▮▮▮▮▮▮      14/14
EDUCATION        ▮▮▮▮▮▮▮▮▮▮          10/10
HEALTH           ▮▮▮▮▮▮▮▮▮▮▮          11/11
PSYCHOLOGY       ▮▮▮▮▮▮▮▮▮▮▮▮         12/12
RELATIONSHIPS    ▮▮▮▮▮▮▮▮▮▮▮          11/11
```

Each row is a category. Each cell in the row is one dimension within
that category. The right-side count shows how many dimensions in that
category you've explored vs the total in that category.

## Cell colors

Cells are colored by their dimension's average score using the
[9-point belief scale](belief-scale.md). Unexplored cells are dark
grey.

## Hovering a cell

Tooltip shows:
- The dimension name
- Its current label and score (e.g. "Centrist (5/9, 70% conf)")
- Whether it's explored or unexplored
- For explored cells: a "→ Click to view lineage" CTA

## Clicking a cell

- **Unexplored cell** → starts an **exploration session**. The probe
  widget at the bottom of the screen displays the next probe for
  that dimension, with an "EXPLORING — <Category> — N left" badge
  floating above the bar. Answer the queued probes (typically 3–5)
  to fill in that dimension.
- **Explored cell** → opens the **[Lineage drawer](lineage-drawer.md)**
  showing every response you've ever logged for that dimension and
  how each one moved your score.

## Headcount in the meta row

Above the strip, you'll see a meta row with your overall stats:
**N responses · M / 124 mapped · X% confidence**. The strip is
considered "filled" once you reach 124/124 — but you don't need to
fill it before any visualization or feature unlocks. The radar /
helix / lineage drawer all work with partial DNA.

## Categories and dimensions

| Category | Dimensions |
|---|---|
| Epistemology | 11 — how you know what you know |
| Spirituality | 10 — relationship to the sacred / transcendent |
| Morality | 14 — ethical frameworks |
| Politics | 12 — political-economic ideology |
| Social | 11 — collectivism ↔ individualism |
| Economics | 11 — free markets ↔ regulated economies |
| Science & Tech | 14 — tech-skeptic ↔ techno-optimist |
| Education | 10 — reformist ↔ traditional |
| Health | 11 — holistic ↔ conventional |
| Psychology | 12 — determinist ↔ autonomous |
| Relationships | 11 — fluid ↔ traditional |

Each dimension within a category has a specific "left↔right" pole
pair (e.g. *Politics → "Progressive ↔ Conservative"*). The radar
chart's per-spoke labels show these pole pairs. The strip itself just
shows the category name; hover any cell to see the dimension name.

## Resizing the strip

Open Settings → Display → "DNA strip cell size" to make cells larger
(better readability on big screens) or smaller (more dimensions
visible without scrolling).

## Fullscreen view

Click the **expand** icon in the top-right of the strip to enter
fullscreen visualization mode. The strip fills the window with
larger cells; press Esc to exit.

## See also

- [The 9-point belief scale](belief-scale.md)
- [Lineage drawer](lineage-drawer.md)
- [All visualizations](visualizations.md)
