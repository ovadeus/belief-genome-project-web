# Harmonize DNA — the hidden audio Easter egg

Your Belief DNA can be heard, not just seen. There is a **deliberately
hidden** audio Easter egg that plays your full 124-cell DNA as music: a
slow chord pad bed derived from your actual scores, with per-cell
sparkle notes layered on top.

There's no button. No menu item. No tooltip. The discovery is part of
the feature.

## How to play

Anywhere on the dashboard (outside of any text input), type the three
letters in sequence: **`b` → `g` → `p`**, within ~1.2 seconds of each
other.

If you're focused inside an input, textarea, or contenteditable
field, the trigger is suppressed (so typing "BGP" in a note doesn't
fire it). If any modifier key is held (⌘, Ctrl, Alt), it's also
suppressed. Shift is allowed (so caps lock doesn't break it).

A short fade-in (~1.5 s) introduces the bed pad; cells of the strip
flash one at a time at ~240 ms cadence as their notes sound.

## How to stop

Type **`b` `g` `p`** again. Playback fades out gently over ~0.8 s.

Or, just let it run to the end. It plays through all 124 cells in
DNA-strip order (~30 seconds total), then eases out: the bed fades
over ~1.2 s while the reverb tail decays for another ~2 s — a ~3-second
"exhale" closes the experience.

## What the music is doing

Two layers play simultaneously:

### Bed pad — the underlying chord progression

Slow chord pad derived from your DNA:

- **Mode** is chosen from your *global centroid* (confidence-weighted
  average of all explored scores):
  - centroid > 5.5 → **Lydian** (bright, raised 4th)
  - 4.5–5.5 → **Ionian** (settled, neutral)
  - < 4.5 → **Aeolian** (introspective, natural minor)
- **Each category** becomes one sustained chord region whose root
  degree is chosen by that category's average score (strong falses
  sit on the tonic, balanced sits on the warm subdominant, strong
  trues sit on the bright dominant)
- The voice is a detuned triangle pair + soft sine, run through a
  vocal-formant band-pass and heavy reverb to sound like distant
  voices rather than a synth pad

Two users with different DNA produce **audibly different** bed
progressions and modal characters. The same DNA always produces the
same music — the entire arrangement is deterministic.

### Overlay — per-cell glass bells

Pure-sine bell tones, one per cell, on a C-major-pentatonic scale
mapped from the 0–9 score:

| Score | Pitch |
|---|---|
| 0 | C4 (low) |
| 5 | C5 (anchor) |
| 9 | A5 (high) |

Pentatonic was chosen because it stays consonant under any jump
pattern — a strip can move from score 0 to score 9 arbitrarily and
still sound musical.

The bed gently dips ~3.5 dB on every overlay note onset (sidechain
ducking) so the notes always read clearly over the pad.

## Re-pressing during the natural-end fade

If you press **`bgp`** during the long exhale at the end, it's
treated as "stop now" — the long fade is interrupted with the user's
faster 0.8 s fade. The next press starts a fresh playback. We
deliberately don't restart from the top during the fade because that
would create a momentary thunk; the chosen UX is "let it go to idle,
then start fresh."

## What it's for

A few things at once:

- **Memorability.** You'll never forget your DNA in the abstract;
  having heard it makes it tangible.
- **Comparison.** Have a friend type BGP on their copy. Their DNA
  sounds different — sometimes radically so.
- **Reflection.** A 30-second pause, listening to your own profile
  played back, often surfaces a feeling you can't quite explain
  from looking at the strip.
- **Delight.** It's an Easter egg. Easter eggs are good.

## What it isn't

- Not a feature you need to use to "get full value" from the app.
  Skip it forever and lose nothing.
- Not a clinical or therapeutic tool. Your DNA is a self-report
  sketch, not a diagnosis; the music is a representation of the
  sketch, not anything more.
- Not customizable yet — the engine constants (tempo, chord
  voicings, mode thresholds) are tuned and don't have UI knobs. If
  you want to experiment, the engine source lives at
  `renderer/lib/harmonize.js`.

## Troubleshooting

- **Cells flash but I hear no sound.** Check system audio volume,
  output device, and whether other apps can play sound. The desktop
  uses the OS default audio output.
- **Cells flash for a couple seconds then stop.** The probe scheduler
  might be intercepting your keystrokes if the bottom bar has focus.
  Click anywhere on the page background and try again.
- **Nothing happens at all.** Confirm you're not focused inside an
  input. Try clicking on the page background first. The detector
  resets if a modifier key is held — make sure neither ⌘ nor Ctrl
  nor Alt is down when you type the letters.
- **It only plays for me — my partner with a different DNA hears the
  same thing.** Confirm you're each using your own desktop signed
  into your own account. The music is generated from the local
  config's belief data; if your partner is signed into your account,
  they'll hear yours.
