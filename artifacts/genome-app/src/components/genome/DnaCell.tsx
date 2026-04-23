import { useEffect, useRef, useState, useCallback } from 'react';
import { BELIEF_LABELS_10, SHEX } from './genome-utils';

export interface DnaCellProps {
  dimId: number;
  dimName: string;
  catKey: string;
  catLabel: string;
  score: number | null;
  confidence: number;
  height?: number;
  onClick?: () => void;
  onHover?: (e: React.MouseEvent, dimName: string, score: number | null, conf: number) => void;
  onLeave?: () => void;
  /**
   * Optional explicit fill color. When provided, the cell renders with this
   * background regardless of `score` (used by compare mode to paint cells by
   * agreement bucket rather than belief value). When undefined, the cell
   * falls back to the default belief-color SHEX[score] for explored cells.
   */
  colorOverride?: string;
  /**
   * When true, the cell is clickable & keyboard-focusable regardless of
   * whether it's explored (compare mode wants every cell selectable so the
   * detail panel can show that dimension's per-side scores).
   */
  forceClickable?: boolean;
}

export default function DnaCell({
  dimId, dimName, catKey, catLabel, score, confidence,
  height = 14, onClick, onHover, onLeave, colorOverride, forceClickable = false,
}: DnaCellProps) {
  const wasUnexploredRef = useRef<boolean>(score === null);
  const [justFilled, setJustFilled] = useState(false);

  useEffect(() => {
    if (wasUnexploredRef.current && score !== null) {
      setJustFilled(true);
      wasUnexploredRef.current = false;
      const t = setTimeout(() => setJustFilled(false), 900);
      return () => clearTimeout(t);
    }
    if (score === null) wasUnexploredRef.current = true;
  }, [score]);

  const explored = score !== null;
  // Explored cells are clickable too — the parent decides whether to open
  // the lineage drawer (explored) or kick off a probe flow (unexplored).
  const clickable = forceClickable || !!onClick;

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (clickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.();
    }
  }, [clickable, onClick]);

  const ariaLabel = explored
    ? `${catLabel}: ${dimName}, ${BELIEF_LABELS_10[score!] || 'Unknown'} (${score}/9), ${confidence}% confidence. Press Enter to view lineage.`
    : `${catLabel}: ${dimName}, Unexplored. Press Enter to explore now.`;

  // Background priority: explicit override > SHEX[score] for explored > undefined
  // for unexplored (CSS handles the gray-striped pattern via .is-unexplored).
  const background = colorOverride ?? (explored ? SHEX[score!] : undefined);
  const hasFill = !!colorOverride || explored;

  return (
    <div
      data-dim-id={dimId}
      data-dim-cat={catKey}
      data-testid={`dna-cell-${dimId}`}
      role="button"
      tabIndex={clickable ? 0 : -1}
      aria-label={ariaLabel}
      className={`dna-strip-cell${hasFill ? ' is-explored' : ' is-unexplored'}${justFilled ? ' just-filled' : ''}`}
      onMouseEnter={e => onHover?.(e, dimName, score, confidence)}
      onMouseLeave={onLeave}
      onFocus={e => onHover?.(e as unknown as React.MouseEvent, dimName, score, confidence)}
      onBlur={onLeave}
      onClick={() => clickable && onClick?.()}
      onKeyDown={handleKey}
      style={{
        height,
        background,
        boxShadow: hasFill ? 'inset 0 0 0 1px var(--border-subtle)' : undefined,
        cursor: clickable ? 'pointer' : 'default',
      }}
    />
  );
}
