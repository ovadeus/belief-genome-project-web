// Scrollable response history with color-coded values

interface HistoryEntry {
  id: number;
  probeText: string;
  probeCategory: string;
  value: number;
  confidence: number | null;
  createdAt: string;
}

interface Props {
  history: HistoryEntry[];
}

function valueColor(val: number): string {
  if (val <= 0.2) return '#ff4757';
  if (val <= 0.4) return '#ff7f50';
  if (val <= 0.6) return 'rgba(255,255,255,0.5)';
  if (val <= 0.8) return '#7bed9f';
  return '#20bf6b';
}

function valueLabel(val: number): string {
  if (val <= 0.1) return 'Strongly Disagree';
  if (val <= 0.3) return 'Disagree';
  if (val <= 0.45) return 'Lean Disagree';
  if (val <= 0.55) return 'Neutral';
  if (val <= 0.7) return 'Lean Agree';
  if (val <= 0.9) return 'Agree';
  return 'Strongly Agree';
}

export default function HistoryList({ history }: Props) {
  if (history.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: 40 }}>
        No responses yet. Start answering probes to build your Belief DNA.
      </div>
    );
  }

  return (
    <div style={{ maxHeight: 500, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {history.map(entry => (
        <div
          key={entry.id}
          style={{
            padding: '12px 16px', borderRadius: 8,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 6 }}>
            {entry.probeText}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 4,
                background: 'rgba(108,143,255,0.15)', color: '#6c8fff',
              }}>
                {entry.probeCategory}
              </span>
              <span style={{ fontSize: 12, fontFamily: 'monospace', color: valueColor(entry.value) }}>
                {valueLabel(entry.value)}
              </span>
            </div>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
              {new Date(entry.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
