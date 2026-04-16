import { useMemo } from 'react';

const AXES = [
  { domain: 'Philosophy',    poleA: 'Relativist',    poleB: 'Absolutist' },
  { domain: 'Religion',      poleA: 'Secular',       poleB: 'Spiritual' },
  { domain: 'Psychology',    poleA: 'Determinist',   poleB: 'Autonomous' },
  { domain: 'Relationships', poleA: 'Fluid',         poleB: 'Traditional' },
  { domain: 'Society',       poleA: 'Collectivist',  poleB: 'Individualist' },
  { domain: 'Economics',     poleA: 'Progressive',   poleB: 'Market-oriented' },
  { domain: 'Sci & Tech',    poleA: 'Tech-skeptic',  poleB: 'Techno-optimist' },
  { domain: 'Politics',      poleA: 'Progressive',   poleB: 'Conservative' },
  { domain: 'Life',          poleA: 'Structured',    poleB: 'Spontaneous' },
];

const SAMPLE_VALUES = [0.65, 0.45, 0.72, 0.38, 0.55, 0.68, 0.82, 0.40, 0.60];

export default function SupportRadarPreview() {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.38;
  const n = AXES.length;

  const points = useMemo(() => {
    return AXES.map((_, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      const r = maxR * SAMPLE_VALUES[i];
      return {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
      };
    });
  }, []);

  const neutralPoints = useMemo(() => {
    return AXES.map((_, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      const r = maxR * 0.5;
      return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    });
  }, []);

  const axisEndpoints = useMemo(() => {
    return AXES.map((_, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      return { x: cx + maxR * Math.cos(angle), y: cy + maxR * Math.sin(angle) };
    });
  }, []);

  const labelPositions = useMemo(() => {
    return AXES.map((axis, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      const lr = maxR + 28;
      return {
        x: cx + lr * Math.cos(angle),
        y: cy + lr * Math.sin(angle),
        domain: axis.domain,
        anchor: Math.abs(Math.cos(angle)) < 0.01 ? 'middle' as const : Math.cos(angle) > 0 ? 'start' as const : 'end' as const,
      };
    });
  }, []);

  const polyPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  const neutralPath = neutralPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="max-w-full">
        {[0.25, 0.5, 0.75, 1].map(f => (
          <circle key={f} cx={cx} cy={cy} r={maxR * f} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
        ))}

        {axisEndpoints.map((p, i) => (
          <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
        ))}

        <path d={neutralPath} fill="none" stroke="#22c55e" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.5} />

        <path d={polyPath} fill="rgba(59,130,246,0.12)" stroke="#3b82f6" strokeWidth={2} />

        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4} fill={SAMPLE_VALUES[i] >= 0.6 ? '#3b82f6' : SAMPLE_VALUES[i] <= 0.4 ? '#ef4444' : '#22c55e'} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} />
        ))}

        {labelPositions.map((lp, i) => (
          <text key={i} x={lp.x} y={lp.y} textAnchor={lp.anchor} dominantBaseline="central" className="fill-muted-foreground" style={{ fontSize: 9, fontFamily: "'Space Mono', monospace" }}>
            {lp.domain}
          </text>
        ))}
      </svg>

      <div className="mt-4 w-full overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-foreground font-semibold font-display">Domain</th>
              <th className="text-left py-2 px-3 text-foreground font-semibold font-display">Pole A (center)</th>
              <th className="text-left py-2 px-3 text-foreground font-semibold font-display">Pole B (edge)</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            {AXES.map(a => (
              <tr key={a.domain} className="border-b border-border/50">
                <td className="py-1.5 px-3 font-medium text-foreground">{a.domain}</td>
                <td className="py-1.5 px-3">{a.poleA}</td>
                <td className="py-1.5 px-3">{a.poleB}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { AXES };
