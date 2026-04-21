import { useState } from 'react';
import { genomeApi } from './GenomeAuthContext';
import { beliefLabel, beliefColor, BELIEF_LABELS_10, BELIEF_GRADIENT } from './genome-utils';

interface ForecastResult {
  value: number;
  label: string;
  confidence: number;
  confidenceLabel: string;
  reasoning: string;
  keyFactors: string[];
}

interface HistoryEntry {
  probeText: string;
  probeCategory: string;
  probeSource?: string;
  value: number;
  createdAt: string;
}

interface Props {
  history: HistoryEntry[];
}

export default function Forecaster({ history }: Props) {
  const [probe, setProbe] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ForecastResult | null>(null);
  const [error, setError] = useState('');

  const runForecast = async () => {
    if (!probe.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await genomeApi('/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ probeText: probe.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Forecast failed');
      }
      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      setError(e.message || 'Forecast failed');
    } finally {
      setLoading(false);
    }
  };

  const color = result ? beliefColor(result.value) : 'var(--accent-bright)';
  const pct = result ? Math.max(2, Math.min(98, result.value)) : 50;

  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
      }}>
        <span style={{
          fontSize: 11, fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
          letterSpacing: 1.5, color: 'var(--text-muted)',
        }}>
          Belief Forecaster
        </span>
        <span style={{
          fontSize: 10, fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
          letterSpacing: 1, color: 'var(--accent-strong)',
        }}>
          AI-Powered Prediction Engine
        </span>
      </div>

      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
        Write a belief statement below — in the same style as your Quantum Reflection probes.
        The AI will read your complete response history, belief dimensions, worldview position,
        and drift patterns to forecast where you would place the slider.
      </p>

      <div style={{ marginBottom: 20 }}>
        <label style={{
          fontSize: 10, fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
          letterSpacing: 1, color: 'var(--text-muted)', display: 'block', marginBottom: 8,
        }}>
          Enter a Probe Statement
        </label>
        <textarea
          value={probe}
          onChange={e => setProbe(e.target.value)}
          placeholder="e.g. The erosion of shared reality is a greater threat to civilisation than any physical crisis..."
          style={{
            width: '100%', minHeight: 100, padding: 16, borderRadius: 8,
            background: 'var(--surface-2)', border: '1px solid var(--border-soft)',
            color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.5, resize: 'vertical',
            fontFamily: 'inherit',
          }}
        />
        <button
          onClick={runForecast}
          disabled={loading || !probe.trim()}
          style={{
            marginTop: 12, padding: '10px 24px', borderRadius: 8, border: 'none',
            background: loading ? 'var(--accent-mid)' : 'var(--accent-bright)',
            color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, cursor: loading ? 'wait' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          {loading ? 'Forecasting...' : 'Forecast'}
        </button>
      </div>

      {error && (
        <div style={{ color: '#ff6b6b', fontSize: 13, padding: 16, marginBottom: 16,
          background: 'rgba(255,68,68,0.1)', borderRadius: 8 }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{
            padding: 16, borderRadius: 8,
            background: 'var(--accent-soft)', border: '1px solid var(--accent-soft)',
          }}>
            <div style={{
              fontSize: 10, fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
              letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 8,
            }}>
              AI Analysis
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {result.reasoning}
            </p>
          </div>

          <div>
            <div style={{
              fontSize: 10, fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
              letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 12,
            }}>
              Forecasted Position
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8,
            }}>
              <span style={{ fontSize: 10, color: '#dc2626', whiteSpace: 'nowrap' }}>Absolute False</span>
              <div style={{
                flex: 1, position: 'relative', height: 8, borderRadius: 4,
                background: BELIEF_GRADIENT,
              }}>
                {[5, 20, 38, 50, 63, 80, 94].map(p => (
                  <div key={p} style={{
                    position: 'absolute', left: `${p}%`, top: -2, width: 1, height: 12,
                    background: 'var(--border-strong)',
                  }} />
                ))}
                <div style={{
                  position: 'absolute', left: `${pct}%`, top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 18, height: 18, borderRadius: '50%',
                  background: color, border: '3px solid #fff',
                  boxShadow: `0 0 10px ${color}, 0 0 22px ${color}66`,
                  transition: 'left 0.4s ease',
                }} />
              </div>
              <span style={{ fontSize: 10, color: '#2563eb', whiteSpace: 'nowrap' }}>Absolute True</span>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8,
            }}>
              <span style={{ fontSize: 16, fontWeight: 700, color }}>{result.label}</span>
              <span style={{ fontSize: 12, fontFamily: "'Space Mono', monospace", color: 'var(--text-muted)' }}>
                {result.value} / 100
              </span>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', fontSize: 8,
              fontFamily: "'Space Mono', monospace", color: 'var(--text-ghost)',
            }}>
              {BELIEF_LABELS_10.map(z => <span key={z}>{z}</span>)}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div>
              <div style={metaLabelStyle}>Confidence</div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} style={{
                    width: 10, height: 10, borderRadius: '50%',
                    border: `1.5px solid ${i < result.confidence ? color : 'var(--border-strong)'}`,
                    background: i < result.confidence ? color : 'transparent',
                    boxShadow: i < result.confidence ? `0 0 6px ${color}80` : 'none',
                  }} />
                ))}
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{result.confidenceLabel}</span>
            </div>

            <div>
              <div style={metaLabelStyle}>Key Factors</div>
              {result.keyFactors.map((f, i) => (
                <div key={i} style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  <span style={{ color, marginRight: 6 }}>&#9656;</span>{f}
                </div>
              ))}
            </div>

            <div>
              <div style={metaLabelStyle}>Data Depth</div>
              {(() => {
                const total = history.length;
                const quality = total >= 100 ? 'Deep' : total >= 50 ? 'Moderate' : total >= 20 ? 'Early' : 'Shallow';
                const qualCol = total >= 100 ? '#44cc88' : total >= 50 ? '#3c82ff' : total >= 20 ? '#ffaa00' : '#787891';
                return (
                  <span style={{ fontSize: 13 }}>
                    <span style={{ color: qualCol, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{total}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}> responses · {quality}</span>
                  </span>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const metaLabelStyle: React.CSSProperties = {
  fontSize: 10, fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
  letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 8,
};
