// 140-character Belief DNA string with color-coded segments

interface Props {
  dnaString: string;
  dimensionsCovered: number;
  totalResponses: number;
  overallConfidence: number;
}

function charColor(ch: string, pos: number): string {
  if (pos <= 7) return '#3dd68c';      // Identity (0-7)
  if (pos <= 10) return '#00d2d3';     // Country (8-10)
  if (pos <= 15) return '#f5a623';     // Zip (11-15)
  if (ch === '\u00B7' || ch === '.' || ch === '_') return 'rgba(255,255,255,0.15)';
  const n = parseInt(ch);
  if (isNaN(n)) return 'rgba(255,255,255,0.4)';
  const colors = [
    '#1ac9b5', '#24d0bc', '#2dd8c4', '#35E4CF', '#70ede0',
    'rgba(200,240,235,0.6)',
    '#90c8ff', '#6FB8FF', '#52A8FF', '#3a8fe0',
  ];
  return colors[n] || 'rgba(255,255,255,0.4)';
}

export default function DnaString({ dnaString, dimensionsCovered, totalResponses, overallConfidence }: Props) {
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
          <div style={{ fontSize: 20, fontFamily: 'monospace', color: '#35E4CF' }}>{dimensionsCovered}/124</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Dimensions</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontFamily: 'monospace', color: '#f5a623' }}>{overallConfidence}%</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Confidence</div>
        </div>
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
              i <= 10 ? 'Country Code (ISO numeric)' :
              i <= 15 ? 'Zip Code' :
              `Dimension ${i - 15} (Position ${i})`
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
        <span style={{ color: '#00d2d3' }}>Country (8-10)</span>
        <span style={{ color: '#f5a623' }}>Zip (11-15)</span>
        <span>Beliefs (16-139)</span>
      </div>

      <div style={{
        display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8,
        fontSize: 10, color: 'rgba(255,255,255,0.4)',
      }}>
        <span><span style={{ color: '#1ac9b5' }}>0</span> Strongly False</span>
        <span><span style={{ color: 'rgba(200,240,235,0.6)' }}>5</span> Neutral</span>
        <span><span style={{ color: '#3a8fe0' }}>9</span> Strongly True</span>
        <span><span style={{ color: 'rgba(255,255,255,0.15)' }}>{'\u00B7'}</span> Unexplored</span>
      </div>
    </div>
  );
}
