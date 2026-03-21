// Horizontal spectrum bars showing per-category belief breakdown
import { CATEGORIES } from '@belief-genome/engine';

interface Props {
  dimensionScores: Record<number, number>;
}

const CAT_RANGES: Record<string, [number, number]> = {
  epistemology: [4,13], spirituality: [14,28], morality: [29,43],
  politics: [44,63], social: [64,78], economics: [79,88],
  science_tech: [89,98], education: [99,103], health: [104,108],
  psychology: [109,118], relationships: [119,127],
};

export default function BreakdownBars({ dimensionScores }: Props) {
  const catKeys = Object.keys(CATEGORIES);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {catKeys.map(cat => {
        const [lo, hi] = CAT_RANGES[cat];
        let sum = 0, count = 0;
        for (let i = lo; i <= hi; i++) {
          if (dimensionScores[i] !== undefined) {
            sum += dimensionScores[i];
            count++;
          }
        }
        const avg = count > 0 ? sum / count : 5;
        const pct = (avg / 9) * 100;
        const catInfo = CATEGORIES[cat];

        return (
          <div key={cat}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{catInfo.label}</span>
              <span style={{ fontSize: 12, fontFamily: 'monospace', color: catInfo.color }}>
                {count > 0 ? avg.toFixed(1) : '—'}
              </span>
            </div>
            <div style={{
              height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${pct}%`, height: '100%', borderRadius: 3,
                background: `linear-gradient(90deg, #6c8fff, ${catInfo.color})`,
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
