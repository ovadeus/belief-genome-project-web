// Probe answering page — the core Belief Genome interaction
import { useState, useEffect, useCallback } from 'react';
import { genomeApi } from '../../components/genome/GenomeAuthContext';
import { PROBE_CATEGORIES } from '@belief-genome/engine';
import { beliefLabel, beliefColor } from '../../components/genome/genome-utils';

function getSemanticLabel(value: number): string {
  return beliefLabel(Math.round(value * 100));
}

function sliderColor(value: number): string {
  return beliefColor(Math.round(value * 100));
}

export default function ProbePage() {
  const [probe, setProbe] = useState<any>(null);
  const [value, setValue] = useState(0.5);
  const [submitting, setSubmitting] = useState(false);
  const [count, setCount] = useState(0);

  const fetchProbe = useCallback(async () => {
    const res = await genomeApi('/probes/next');
    if (res.ok) {
      const data = await res.json();
      setProbe(data);
      setValue(0.5); // Reset slider
    }
  }, []);

  useEffect(() => { fetchProbe(); }, [fetchProbe]);

  const handleSubmit = async () => {
    if (!probe) return;
    setSubmitting(true);
    await genomeApi('/probes/respond', {
      method: 'POST',
      body: JSON.stringify({
        probeText: probe.statement,
        probeCategory: probe.category,
        probeSource: probe.source,
        value,
      }),
    });
    setCount(c => c + 1);
    setSubmitting(false);
    fetchProbe();
  };

  if (!probe) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.4)' }}>
        Loading probe...
      </div>
    );
  }

  const catInfo = PROBE_CATEGORIES[probe.category];

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, marginBottom: 32, color: '#fff' }}>Belief Probe</h1>

      {/* Probe count */}
      {count > 0 && (
        <div style={{
          textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 16,
        }}>
          {count} answered this session
        </div>
      )}

      {/* Probe card */}
      <div style={{
        padding: '32px 28px', borderRadius: 16,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(108,143,255,0.15)',
        marginBottom: 32,
      }}>
        {/* Category badge */}
        <div style={{ marginBottom: 20, textAlign: 'center' }}>
          <span style={{
            fontSize: 11, padding: '4px 12px', borderRadius: 12,
            background: 'rgba(108,143,255,0.12)', color: '#6c8fff',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            {catInfo?.label || probe.category}
          </span>
        </div>

        {/* Statement */}
        <div style={{
          fontSize: 18, lineHeight: 1.6, textAlign: 'center',
          color: 'rgba(255,255,255,0.9)', marginBottom: 32,
          fontStyle: 'italic',
        }}>
          "{probe.statement}"
        </div>

        {/* Semantic label */}
        <div style={{
          textAlign: 'center', fontSize: 16, fontWeight: 600,
          color: sliderColor(value), marginBottom: 16,
          transition: 'color 0.2s',
        }}>
          {getSemanticLabel(value)}
        </div>

        {/* Slider */}
        <input
          type="range"
          min={0} max={1} step={0.01}
          value={value}
          onChange={e => setValue(parseFloat(e.target.value))}
          style={{
            width: '100%', cursor: 'pointer',
            accentColor: sliderColor(value),
          }}
        />

        {/* Scale labels */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4,
        }}>
          <span>False to me</span>
          <span>Uncertain</span>
          <span>Deeply true to me</span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            padding: '12px 32px', borderRadius: 8, border: 'none',
            background: '#6c8fff', color: '#fff', fontSize: 14,
            cursor: submitting ? 'wait' : 'pointer',
            opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting ? 'Submitting...' : 'Submit & Next'}
        </button>
        <button
          onClick={fetchProbe}
          style={{
            padding: '12px 24px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)',
            background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Skip
        </button>
      </div>
    </div>
  );
}
