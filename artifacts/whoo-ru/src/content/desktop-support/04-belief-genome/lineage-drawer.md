# The lineage drawer

When you click an **explored** cell on the Belief DNA strip, a
right-side drawer slides in showing how that dimension's score was
built — every response that contributed and what it changed.

This answers the question "Why is this dimension at 6.2?" in concrete
terms: which probes you answered, what you said, and how each answer
moved the running average.

## Opening the drawer

1. Go to **Belief Genome → Belief DNA**.
2. Hover any cell to confirm it's explored (tooltip shows a numeric
   score). Cells without scores are unexplored — clicking those
   starts an exploration session instead of opening lineage.
3. Click an explored cell.

The drawer slides in from the right. Click the X, click outside the
drawer, or press **Esc** to close.

## What's in the drawer

### Header card

- **Score chip** — large colored box with the current score (0–9)
  and the gradient color
- **Dimension name** — e.g. "Free Markets ↔ Regulated Economies"
- **Category** — pill-style category tag
- **Stats row** — total responses contributing, current confidence %,
  centroid label

### Toggle: Top Contributors / Full Timeline

Two views, one switch:

- **Top Contributors** — the 5 responses that moved the score the
  most (largest absolute delta from prior score). Useful for "what
  most defined this dimension for me?"
- **Full Timeline** — every response in chronological order. Useful
  for "how did I get here over time?"

### Each row

For each contributing response:

- **Date** — when you answered
- **Probe text** — the actual question
- **Your answer** — Likert restatement (e.g. "Strongly Agree") +
  numeric value
- **Score transition** — `prevScore → newScore` with the delta
  colored by direction:
  - **green** = moved you toward the right pole (positive delta
    > 0.05)
  - **red** = moved you toward the left pole (negative delta > 0.05)
  - **gray** = neutral move (within ±0.05)
- **Confidence** — `prev% → new%`
- **Your note** (if you wrote one)

For the very first response that touched a dimension, `prevScore`
shows as `null` (or `—`) — there was nothing to update against.

## Why score transitions look the way they do

Scores are confidence-weighted averages. A high-confidence answer
with a low quality weight has less impact than a low-confidence one
that exposed new information. The drawer doesn't show all the math —
it just shows the resulting transition. If you want to inspect the
full calculation, the lineage data lives in your local
`belief_lineage.json` and is human-readable.

## Direction labels

The "True" pole always corresponds to the dimension's right side.
But "True" doesn't mean "correct" — it just means the right pole of
that specific dimension. For Politics, the right pole is
**Conservative**; for Economics, it's **Market-oriented**; for
Spirituality, it's **Spiritual**.

So a green delta on a Politics dimension means "moved toward
Conservative," not "moved toward correct." It's directional, not
evaluative.

## Editing a past response

The drawer is read-only — you can't edit responses from inside it.
To change a past answer, go to **Belief Genome → History**, find
the response, and re-answer. The lineage updates automatically.

## Sharing a lineage view

Export to PDF / image isn't built yet. For now, screenshot it. The
drawer is sized to fit comfortably in a screenshot for sharing
context with a friend or in a discussion.

## See also

- [The DNA strip](dna-strip.md)
- [The 9-point belief scale](belief-scale.md)
- [History panel](visualizations.md#history) — the alternate way to
  audit your responses
