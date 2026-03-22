// Analyze page — triggers full DNA recalculation from all responses
import { useState } from 'react';
import { genomeApi } from '../../components/genome/GenomeAuthContext';

export default function AnalyzePage() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const runAnalysis = async () => {
    setAnalyzing(true);
    setError('');
    setResult(null);
    try {
      const res = await genomeApi('/analyze', { method: 'POST' });
      if (!res.ok) throw new Error('Analysis failed');
      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      setError(e.message || 'Analysis failed');
    }
    setAnalyzing(false);
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
        Analyze
      </h1>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 32, lineHeight: 1.6 }}>
        Rebuild your Belief DNA from scratch. This recalculates all 124 dimension scores
        from your complete response history and regenerates your 135-character DNA string.
      </p>

      {/* Trigger */}
      <div style={{
        padding: 28, borderRadius: 16,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(108,143,255,0.12)',
        marginBottom: 24, textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.6 }}>&#x2699;</div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20, maxWidth: 400, margin: '0 auto 20px' }}>
          Your scores update incrementally with each probe response.
          Use this to force a full recalculation if you suspect drift or after syncing data from another device.
        </p>
        <button
          onClick={runAnalysis}
          disabled={analyzing}
          style={{
            padding: '12px 32px', borderRadius: 8, border: 'none',
            background: analyzing ? 'rgba(108,143,255,0.3)' : '#6c8fff',
            color: '#fff', fontSize: 14, fontWeight: 600,
            cursor: analyzing ? 'wait' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {analyzing ? 'Analyzing...' : 'Run Full Analysis'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: 16, borderRadius: 10,
          background: 'rgba(255,71,87,0.08)',
          border: '1px solid rgba(255,71,87,0.2)',
          color: '#ff4757', fontSize: 13, marginBottom: 20,
        }}>
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={{
          padding: 24, borderRadius: 12,
          background: 'rgba(46,213,115,0.04)',
          border: '1px solid rgba(46,213,115,0.15)',
        }}>
          <h3 style={{
            fontSize: 12, textTransform: 'uppercase', letterSpacing: 1,
            color: '#2ed573', marginBottom: 16,
            fontFamily: "'Space Mono', monospace",
          }}>
            Analysis Complete
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#6c8fff' }}>
                {result.totalResponses || 0}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginTop: 4 }}>
                Responses Processed
              </div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#a78bfa' }}>
                {result.dimensionsCovered || 0}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginTop: 4 }}>
                Dimensions Mapped
              </div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#22d3ee' }}>
                {result.overallConfidence ? `${Math.round(result.overallConfidence * 100)}%` : '—'}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginTop: 4 }}>
                Confidence
              </div>
            </div>
          </div>
          {result.dnaString && (
            <div style={{
              marginTop: 20, padding: 14, borderRadius: 8,
              background: 'rgba(0,0,0,0.3)',
              fontFamily: "'Space Mono', monospace",
              fontSize: 11, color: '#6c8fff',
              letterSpacing: '0.15em', wordBreak: 'break-all', lineHeight: 1.8,
            }}>
              {result.dnaString}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
