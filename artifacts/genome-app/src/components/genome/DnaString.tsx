import { SHEX } from './genome-utils';

interface Props {
  dnaString: string;
  dimensionsCovered: number;
  totalResponses: number;
  overallConfidence: number;
}

// Coherence-letter ladder, green → red.
// A = most coherent (perfect mirror within framing pairs)
// E = least coherent (anti-mirror)
const COHERENCE_COLORS: Record<string, string> = {
  A: '#3dd68c', // bright green
  B: '#a3e635', // lime
  C: '#facc15', // yellow
  D: '#fb923c', // orange
  E: '#dc2626', // red
};

const PLACEHOLDER_CHARS = new Set(['\u00B7', '.', '_']);

function isV2(dnaString: string): boolean {
  // V1 = 140 chars, no separator. V2 = 265 chars with literal '-' at pos 16.
  return dnaString.length === 265 && dnaString[16] === '-';
}

function charColor(ch: string, pos: number, v2: boolean): string {
  if (pos <= 7) return '#3dd68c';        // identity (green)
  if (pos <= 10) return '#00d2d3';       // country (cyan)
  if (pos <= 15) return '#f5a623';       // zip (orange)
  if (v2 && pos === 16) return 'var(--text-muted)'; // V2 separator '-'
  if (PLACEHOLDER_CHARS.has(ch)) return 'var(--border-strong)';
  if (COHERENCE_COLORS[ch]) return COHERENCE_COLORS[ch];
  const n = parseInt(ch);
  if (isNaN(n)) return 'var(--text-muted)';
  return SHEX[n] || 'var(--text-muted)';
}

function positionTitle(ch: string, pos: number, v2: boolean): string {
  if (pos === 0) return 'Century';
  if (pos <= 2) return 'Birth Year';
  if (pos <= 4) return 'Birth Month';
  if (pos <= 6) return 'Birth Day';
  if (pos === 7) return 'Sex';
  if (pos <= 10) return 'Country Code (ISO numeric)';
  if (pos <= 15) return 'Zip Code';
  if (v2 && pos === 16) return 'Separator';
  if (v2) {
    // V2: positions 17+ alternate amplitude/coherence per dimension.
    const offset = pos - 17;
    const dim = Math.floor(offset / 2) + 1;
    const isCoherence = offset % 2 === 1;
    if (isCoherence) {
      const ladder = COHERENCE_COLORS[ch]
        ? ` (${ch} = ${{ A: 'mirror', B: 'near-mirror', C: 'mixed', D: 'near anti-mirror', E: 'anti-mirror' }[ch]})`
        : ' (no completed framing pair yet)';
      return `Dimension ${dim} coherence${ladder}`;
    }
    return `Dimension ${dim} amplitude (Position ${pos})`;
  }
  // V1: positions 16-139 are one char per dimension (amplitude only).
  return `Dimension ${pos - 15} (Position ${pos})`;
}

export default function DnaString({ dnaString, dimensionsCovered, totalResponses, overallConfidence }: Props) {
  const v2 = isV2(dnaString);
  const beliefRange = v2 ? '17-264' : '16-139';

  return (
    <div>
      <div style={{
        display: 'flex', gap: 24, marginBottom: 20, justifyContent: 'center', flexWrap: 'wrap',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontFamily: 'monospace', color: 'var(--accent-bright)' }}>{totalResponses}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Responses</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontFamily: 'monospace', color: '#22c55e' }}>{dimensionsCovered}/124</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Dimensions</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontFamily: 'monospace', color: '#f5a623' }}>{overallConfidence}%</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Confidence</div>
        </div>
      </div>

      <div style={{
        fontFamily: 'monospace', fontSize: 15, letterSpacing: 3,
        wordBreak: 'break-all', lineHeight: 2.2, textAlign: 'center',
        padding: '20px 24px', borderRadius: 12,
        background: 'var(--surface-1)', border: '1px solid var(--accent-soft)',
      }}>
        {dnaString.split('').map((ch, i) => (
          <span
            key={i}
            style={{ color: charColor(ch, i, v2) }}
            title={positionTitle(ch, i, v2)}
          >
            {ch}
          </span>
        ))}
      </div>

      <div style={{
        display: 'flex', justifyContent: 'center', gap: 12, marginTop: 10,
        fontSize: 9, color: 'var(--text-muted)', flexWrap: 'wrap',
      }}>
        <span style={{ color: '#3dd68c' }}>Identity (0-7)</span>
        <span style={{ color: '#00d2d3' }}>Country (8-10)</span>
        <span style={{ color: '#f5a623' }}>Zip (11-15)</span>
        <span>Beliefs ({beliefRange})</span>
      </div>

      <div style={{
        display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8,
        fontSize: 10, color: 'var(--text-muted)', flexWrap: 'wrap',
      }}>
        <span><span style={{ color: '#dc2626' }}>0</span> Absolute False</span>
        <span><span style={{ color: '#22c55e' }}>5</span> Uncertain</span>
        <span><span style={{ color: '#2563eb' }}>9</span> Absolute True</span>
        <span><span style={{ color: 'var(--border-strong)' }}>{'\u00B7'}</span> Unexplored</span>
      </div>

      {v2 && (
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 12, marginTop: 8,
          fontSize: 10, color: 'var(--text-muted)', flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <span style={{ color: 'var(--text-muted)', marginRight: 4 }}>Coherence:</span>
          <span><span style={{ color: COHERENCE_COLORS.A, fontWeight: 600 }}>A</span> Mirror</span>
          <span><span style={{ color: COHERENCE_COLORS.B, fontWeight: 600 }}>B</span> Near-mirror</span>
          <span><span style={{ color: COHERENCE_COLORS.C, fontWeight: 600 }}>C</span> Mixed</span>
          <span><span style={{ color: COHERENCE_COLORS.D, fontWeight: 600 }}>D</span> Near anti-mirror</span>
          <span><span style={{ color: COHERENCE_COLORS.E, fontWeight: 600 }}>E</span> Anti-mirror</span>
          <span><span style={{ color: 'var(--border-strong)' }}>{'\u00B7'}</span> No pair yet</span>
        </div>
      )}
    </div>
  );
}
