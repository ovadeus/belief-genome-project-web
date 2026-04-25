# The 9-point belief scale

Every probe maps to a **0–100 slider**. We bucket the slider into nine
ordered belief states with deliberate, distinguishable colors so the
spectrum is readable at a glance.

| Slider value | Label | Color |
|---|---|---|
| 0–11 | Absolute False | `#dc2626` (deep red) |
| 12–22 | Deeply False | `#ef4444` (red) |
| 23–33 | False | `#f87171` (warm red) |
| 34–44 | Leaning False | `#fca5a5` (pink) |
| 45–55 | Uncertain | `#22c55e` (green) |
| 56–66 | Leaning True | `#93c5fd` (light blue) |
| 67–77 | True | `#60a5fa` (blue) |
| 78–88 | Deeply True | `#3b82f6` (medium blue) |
| 89–100 | Absolute True | `#2563eb` (deep blue) |

(Visual: a horizontal stripe red→red→pink→pink→green→light-blue→blue→blue→blue.)

## Why red → green → blue (not red → green)

Red and blue are the most distinguishable opposing hues for the human
eye; green in the middle signals genuine **neutrality** rather than
"disagreement." This replaces the older green↔blue scheme that felt
too close on the spectrum and made middle values hard to tell apart
from one pole.

## Why "Uncertain" is in the middle, not "Neutral"

> **Uncertain is a real, valid answer.**
> It means "I don't have enough information to lean either way" —
> not a failure to commit.

When the slider sits in the 45–55 band, you're saying you've engaged
with the question but genuinely haven't formed a position. That's
useful data — it surfaces dimensions where exposure or experience
might shift you, and it tells the AI what *not* to assume.

If you skip a probe, that's different — skips don't enter your DNA
at all.

## How the bucket maps to the DNA strip

Every cell in the DNA strip is colored by its **dimension's average
score** across all your answers in that dimension. So a dimension you
answered as 8/9, 8/9, 9/9 → average 8.3 → bucket 8 → "Deeply True"
shade of blue.

A dimension that's mixed (5/9, 8/9, 2/9) averages to 5.0 → bucket 5 →
green "Uncertain." The strip surfaces that you've engaged but don't
have a coherent lean — which is meaningful.

## Confidence

Each cell also has a **confidence percentage** based on:

- How many responses contributed (more responses → higher confidence)
- How tight the cluster is (low variance → higher confidence)
- How recently you answered (recent answers weight more)

Confidence appears in the cell tooltip on hover ("Politics: Centrist
(5/9, 70% conf)") and shapes the size of the LED meter on the radar
chart — high-confidence dimensions get brighter, more saturated
indicators.

## "Deep" vs "Strong" — same thing, different visual

You'll see both **Deeply True** (in the scale label) and **Strongly
True** (in the radar / lineage drawer copy). They mean the same
thing — different surfaces just chose different words historically.
We're consolidating to "Deeply" everywhere; "Strongly" is the legacy
copy.
