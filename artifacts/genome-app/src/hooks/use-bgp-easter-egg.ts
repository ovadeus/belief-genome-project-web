// BGP Easter-egg key-sequence detector.
//
// Listens for the user typing b → g → p in sequence within 1.2 seconds.
// On match, dispatches a window CustomEvent 'bgp:harmonize-toggle' which the
// DnaStrip listens to and uses to start/stop harmonize playback.
//
// Suppressed when:
// - Focus is in an editable element (input/textarea/contentEditable).
// - The user is composing input via an IME (key events have isComposing true).
// - Any modifier key (ctrl/meta/alt) is held — leave shift alone so keys
//   aren't typo-sensitive to capslock.
//
// Toggle semantics: each successful BGP recognition fires the event once;
// the listener decides whether that means "start" or "stop." Holding the
// keys does nothing — the user must type the three letters in order.

import { useEffect } from 'react';

const SEQUENCE = ['b', 'g', 'p'] as const;
const WINDOW_MS = 1200;
const EVENT_NAME = 'bgp:harmonize-toggle';

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return false;
}

export function useBgpEasterEgg(enabled: boolean = true): void {
  useEffect(() => {
    if (!enabled) return;

    let progress = 0;
    let firstKeyAt = 0;

    const reset = (): void => {
      progress = 0;
      firstKeyAt = 0;
    };

    const onKeyDown = (e: KeyboardEvent): void => {
      // IME composition — discard.
      if (e.isComposing || e.keyCode === 229) {
        reset();
        return;
      }
      // Modifier-augmented keystrokes are likely browser shortcuts.
      if (e.ctrlKey || e.metaKey || e.altKey) {
        reset();
        return;
      }
      // Don't capture keystrokes the user is sending to a form.
      if (isEditableTarget(e.target)) {
        reset();
        return;
      }

      // e.key is already case-insensitive when shift isn't held; lowercase to
      // be safe across browsers and capslock.
      const key = e.key.toLowerCase();
      const expected = SEQUENCE[progress];

      if (key !== expected) {
        // If they typed 'b' again mid-sequence, treat it as a fresh start.
        if (key === SEQUENCE[0]) {
          progress = 1;
          firstKeyAt = Date.now();
        } else {
          reset();
        }
        return;
      }

      // Sequence window check (only after the first key is committed).
      if (progress === 0) {
        firstKeyAt = Date.now();
      } else if (Date.now() - firstKeyAt > WINDOW_MS) {
        // Too slow — restart from this key (only valid if it's the first).
        if (key === SEQUENCE[0]) {
          progress = 1;
          firstKeyAt = Date.now();
        } else {
          reset();
        }
        return;
      }

      progress += 1;
      if (progress === SEQUENCE.length) {
        window.dispatchEvent(new CustomEvent(EVENT_NAME));
        reset();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [enabled]);
}

export const BGP_HARMONIZE_TOGGLE_EVENT = EVENT_NAME;
