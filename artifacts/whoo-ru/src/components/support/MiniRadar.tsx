import { useMemo } from 'react';
import { DOMAIN_AXES, beliefColorFromValue } from '@/lib/beliefScale';

interface MiniRadarProps {
  values?: Record<string, number>;
  size?: number;
  showLabels?: boolean;
  showTooltipOnHover?: boolean;
}

const SAMPLE: Record<string, number> = {
  philosophy:0.62, religion:0.45, psychology:0.71, relationships:0.58,
  society:0.33, economics:0.68, science_tech:0.82, politics:0.24, life:0.55,
};

export function MiniRadar({
  values = SAMPLE, size = 420, showLabels = true, showTooltipOnHover = true,
}: MiniRadarProps) {
  const cx = size / 2, cy = size / 2;
  const radius = size * 0.36;
  const n = DOMAIN_AXES.length;

  const pointAt = (i: number, frac: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return {
      x: cx + Math.cos(angle) * radius * frac,
      y: cy + Math.sin(angle) * radius * frac,
    };
  };

  const rings = [0.25, 0.5, 0.75, 1.0];

  const userPoints = useMemo(
    () => DOMAIN_AXES.map((axis, i) => {
      const v = values[axis.key] ?? 0.5;
      return pointAt(i, Math.max(0.05, Math.min(1, v)));
    }),
    [values, size],
  );

  const userPath = userPoints.map(p => `${p.x},${p.y}`).join(' ');
  const neutralPath = Array.from({ length: n })
    .map((_, i) => { const p = pointAt(i, 0.5); return `${p.x},${p.y}`; })
    .join(' ');

  return (
    <div style={{ width: size, height: size, maxWidth: '100%' }}>
      <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%">
        <rect width={size} height={size} fill="transparent" />

        {rings.map((r, i) => (
          <polygon key={i}
            points={Array.from({ length: n })
              .map((_, j) => { const p = pointAt(j, r); return `${p.x},${p.y}`; })
              .join(' ')}
            fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
        ))}

        {DOMAIN_AXES.map((_, i) => {
          const end = pointAt(i, 1);
          return (
            <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y}
              stroke="var(--border-soft)" strokeWidth={1} />
          );
        })}

        <polygon points={neutralPath}
          fill="rgba(34,197,94,0.05)" stroke="rgba(34,197,94,0.4)"
          strokeWidth={1} strokeDasharray="4 4" />

        <polygon points={userPath}
          fill="rgba(108,99,255,0.15)" stroke="rgba(108,99,255,0.85)"
          strokeWidth={2} />

        {userPoints.map((p, i) => {
          const v = values[DOMAIN_AXES[i].key] ?? 0.5;
          const color = beliefColorFromValue(v * 100);
          const axis = DOMAIN_AXES[i];
          const pct = Math.round(v * 100);
          const label = v >= 0.56 ? axis.right : v <= 0.44 ? axis.left : axis.mid;
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={5} fill={color}
                stroke="var(--text-primary)" strokeWidth={1.5}>
                {showTooltipOnHover && <title>{`${axis.short}: ${label} (${pct}%)`}</title>}
              </circle>
            </g>
          );
        })}

        {showLabels && DOMAIN_AXES.map((axis, i) => {
          const p = pointAt(i, 1.18);
          const anchor = Math.abs(p.x - cx) < 20 ? 'middle' : p.x > cx ? 'start' : 'end';
          return (
            <g key={`lbl-${i}`} textAnchor={anchor}>
              <text x={p.x} y={p.y} fill="var(--text-primary)"
                    fontSize={12} fontFamily="'DM Sans', sans-serif" fontWeight={600}>
                {axis.short}
              </text>
              <text x={p.x} y={p.y + 14} fill="var(--text-muted)"
                    fontSize={9} fontFamily="'Space Mono', monospace">
                {axis.left}  ↔  {axis.right}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default MiniRadar;
