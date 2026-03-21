// 135-character Belief DNA string with color-coded segments

interface Props {
  dnaString: string;
  dimensionsCovered: number;
  totalResponses: number;
  overallConfidence: number;
}

function charColor(ch: string, pos: number): string {
  if (pos <= 7) return '#3dd68c';     // Identity
  if (pos <= 9) return '#00d2d3';     // Country
  if (pos <= 14) return '#f5a623';    // Zip
  if (ch === '\u00B7' || ch === '.' || ch === '_') return 'rgba(255,255,255,0.15)';
  const n = parseInt(ch);
  if (isNaN(n)) return 'rgba(255,255,255,0.4)';
  // Spectrum: 0=red → 5=neutral → 9=green
  const colors = [
    '#ff4757', '#ff6348', '#ff7f50', '#ffa502', '#f5a623',
    'rgba(255,255,255,0.5)',
    '#7bed9f', '#2ed573', '#26de81', '#20bf6b',
  ];
  return colors[n] || 'rgba(255,255,255,0.4)';
}

export default function DnaString({ dnaString, dimensionsCovered, totalResponses, overallConfidence }: Props) {
  const countryCode = dnaString.slice(8, 10) === '00' ? '' : dnaString.slice(8, 10);

  return (
    <div>
      {/* Stats */}
      <div style={{
        display: 'flex', gap: 24, marginBottom: 20, justifyContent: 'center', flexWrap: 'wrap',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontFamily: 'monospace', color: '#6c8fff' }}>{totalResponses}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Responses</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontFamily: 'monospace', color: '#2ed573' }}>{dimensionsCovered}/124</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Dimensions</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontFamily: 'monospace', color: '#f5a623' }}>{overallConfidence}%</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Confidence</div>
        </div>
        {countryCode && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontFamily: 'monospace', color: '#00d2d3' }}>{countryCode}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Country</div>
          </div>
        )}
      </div>

      {/* DNA String display */}
      <div style={{
        fontFamily: 'monospace', fontSize: 15, letterSpacing: 3,
        wordBreak: 'break-all', lineHeight: 2.2, textAlign: 'center',
        padding: '20px 24px', borderRadius: 12,
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(108,143,255,0.15)',
      }}>
        {dnaString.split('').map((ch, i) => (
          <span
            key={i}
            style={{ color: charColor(ch, i) }}
            title={
              i === 0 ? 'Century' :
              i <= 2 ? 'Birth Year' :
              i <= 4 ? 'Birth Month' :
              i <= 6 ? 'Birth Day' :
              i === 7 ? 'Sex' :
              i <= 9 ? 'Country Code' :
              i <= 14 ? 'Zip Code' :
              `Dimension ${i - 11} (Position ${i})`
            }
          >
            {ch}
          </span>
        ))}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 12, marginTop: 10,
        fontSize: 9, color: 'rgba(255,255,255,0.4)', flexWrap: 'wrap',
      }}>
        <span style={{ color: '#3dd68c' }}>Identity (0-7)</span>
        <span style={{ color: '#00d2d3' }}>Country (8-9)</span>
        <span style={{ color: '#f5a623' }}>Zip (10-14)</span>
        <span>Beliefs (15-138)</span>
      </div>

      <div style={{
        display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8,
        fontSize: 10, color: 'rgba(255,255,255,0.4)',
      }}>
        <span><span style={{ color: '#ff4757' }}>0</span> Strongly False</span>
        <span><span style={{ color: 'rgba(255,255,255,0.5)' }}>5</span> Neutral</span>
        <span><span style={{ color: '#20bf6b' }}>9</span> Strongly True</span>
        <span><span style={{ color: 'rgba(255,255,255,0.15)' }}>{'\u00B7'}</span> Unexplored</span>
      </div>
    </div>
  );
}
