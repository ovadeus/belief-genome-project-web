import {
  BELIEF_COLORS, BELIEF_LABELS,
  beliefIndexFromValue, beliefLabelFromValue,
} from '@/lib/beliefScale';

type Variant = 'gradient' | 'swatches' | 'compact';

interface BeliefScaleProps {
  variant?: Variant;
  value?: number;
  showLabels?: boolean;
  className?: string;
}

const GRADIENT = `linear-gradient(to right, ${BELIEF_COLORS.join(', ')})`;

export function BeliefScale({
  variant = 'gradient', value, showLabels = true, className = '',
}: BeliefScaleProps) {

  if (variant === 'swatches') {
    return (
      <div className={className}>
        <div className="grid grid-cols-9 gap-1">
          {BELIEF_COLORS.map((c, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="h-6 w-full rounded" style={{ background: c }} />
              {showLabels && (
                <span className="mt-1.5 text-center font-mono text-[10px] leading-tight text-muted-foreground">
                  {BELIEF_LABELS[i]}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex h-2 w-32 overflow-hidden rounded-full ${className}`}>
        {BELIEF_COLORS.map((c, i) => (
          <div key={i} className="h-full flex-1" style={{ background: c }} />
        ))}
      </div>
    );
  }

  const hasPointer = typeof value === 'number';
  const markerPct = hasPointer ? Math.max(0, Math.min(100, value!)) : 0;
  const markerLabel = hasPointer ? beliefLabelFromValue(value!) : '';
  const markerColor = hasPointer ? BELIEF_COLORS[beliefIndexFromValue(value!)] : '';

  return (
    <div className={className}>
      <div className="relative">
        <div className="h-3 w-full rounded-full" style={{ background: GRADIENT }} />
        {hasPointer && (
          <div
            className="absolute -top-1 flex flex-col items-center"
            style={{ left: `${markerPct}%`, transform: 'translateX(-50%)' }}
          >
            <div
              className="h-5 w-5 rounded-full border-2 border-white shadow-lg"
              style={{ background: markerColor }}
            />
            <div className="mt-1 whitespace-nowrap rounded bg-black/80 px-2 py-0.5 font-mono text-[10px] text-foreground">
              {markerLabel} · {markerPct}
            </div>
          </div>
        )}
      </div>

      {showLabels && (
        <div className="mt-3 flex justify-between font-mono text-[10px]">
          <span style={{ color: BELIEF_COLORS[0] }}>Absolute False</span>
          <span style={{ color: BELIEF_COLORS[4] }}>Uncertain</span>
          <span style={{ color: BELIEF_COLORS[8] }}>Absolute True</span>
        </div>
      )}
    </div>
  );
}

export default BeliefScale;
