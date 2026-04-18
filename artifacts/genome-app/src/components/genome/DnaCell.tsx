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
}

export default function DnaCell({
  dimId, dimName, catKey, catLabel, score, confidence,
  height = 14, onClick, onHover, onLeave,
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

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (!explored && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.();
    }
  }, [explored, onClick]);

  const ariaLabel = explored
    ? `${catLabel}: ${dimName}, ${BELIEF_LABELS_10[score!] || 'Unknown'} (${score}/9), ${confidence}% confidence`
    : `${catLabel}: ${dimName}, Unexplored. Press Enter to explore now.`;

  return (
    <div
      data-dim-id={dimId}
      data-dim-cat={catKey}
      data-testid={`dna-cell-${dimId}`}
      role="button"
      tabIndex={explored ? -1 : 0}
      aria-label={ariaLabel}
      className={`dna-strip-cell${explored ? ' is-explored' : ' is-unexplored'}${justFilled ? ' just-filled' : ''}`}
      onMouseEnter={e => onHover?.(e, dimName, score, confidence)}
      onMouseLeave={onLeave}
      onFocus={e => onHover?.(e as unknown as React.MouseEvent, dimName, score, confidence)}
      onBlur={onLeave}
      onClick={() => !explored && onClick?.()}
      onKeyDown={handleKey}
      style={{
        height,
        background: explored ? SHEX[score!] : undefined,
        boxShadow: explored ? 'inset 0 0 0 1px rgba(255,255,255,0.08)' : undefined,
      }}
    />
  );
}
