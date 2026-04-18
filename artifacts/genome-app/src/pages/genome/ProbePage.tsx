import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { genomeApi } from '../../components/genome/GenomeAuthContext';
import { PROBE_CATEGORIES } from '@belief-genome/engine';
import { beliefLabel, beliefColor } from '../../components/genome/genome-utils';
import { useExplore } from '../../components/genome/ExploreContext';
import { Compass, X } from 'lucide-react';

function getSemanticLabel(value: number): string { return beliefLabel(Math.round(value * 100)); }
function sliderColor(value: number): string { return beliefColor(Math.round(value * 100)); }

const EXPLORE_IDLE_MS = 30_000;

export default function ProbePage() {
  const [probe, setProbe] = useState<any>(null);
  const [value, setValue] = useState(0.5);
  const [submitting, setSubmitting] = useState(false);
  const [count, setCount] = useState(0);

  const { exploreIntent, clearExplore, advanceQueue } = useExplore();
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isExploring = !!exploreIntent;

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (!exploreIntent) return;
    idleTimerRef.current = setTimeout(() => {
      clearExplore();
    }, EXPLORE_IDLE_MS);
  }, [exploreIntent, clearExplore]);

  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  const fetchProbe = useCallback(async (dimId?: number) => {
    let url = '/probes/next';
    if (dimId) url += `?dimId=${dimId}`;
    const res = await genomeApi(url);
    if (res.ok) {
      const data = await res.json();
      setProbe(data);
      setValue(0.5);
    }
  }, []);

  useEffect(() => {
    if (isExploring && exploreIntent.dimQueue.length > 0) {
      fetchProbe(exploreIntent.dimQueue[0]);
      resetIdleTimer();
    } else if (!isExploring) {
      fetchProbe();
    }
  }, [isExploring, exploreIntent?.dimQueue[0]]);

  const handleSubmit = async () => {
    if (!probe) return;
    setSubmitting(true);
    resetIdleTimer();
    const payload: Record<string, any> = {
      probeText: probe.statement,
      probeCategory: probe.category,
      probeSource: probe.source,
      value,
    };
    if (probe.dimensionWeights) payload.dimensionWeights = probe.dimensionWeights;
    if (probe.quality) payload.quality = probe.quality;
    try {
      const res = await genomeApi('/probes/respond', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err?.error || 'Could not save your response. Please try again.');
        setSubmitting(false);
        return;
      }
      setCount(c => c + 1);
    } catch {
      toast.error('Network error — your response was not saved.');
      setSubmitting(false);
      return;
    }
    setSubmitting(false);

    if (isExploring) {
      advanceQueue();
    } else {
      fetchProbe();
    }
  };

  const handleSkip = () => {
    resetIdleTimer();
    if (isExploring) {
      advanceQueue();
    } else {
      fetchProbe();
    }
  };

  const handleActivity = useCallback(() => {
    if (isExploring) resetIdleTimer();
  }, [isExploring, resetIdleTimer]);

  if (!probe) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.4)' }}>
        Loading probe...
      </div>
    );
  }

  const catInfo = PROBE_CATEGORIES[probe.category];

  return (
    <div
      style={{ maxWidth: 600, margin: '0 auto', position: 'relative' }}
      onMouseMove={handleActivity}
    >
      <h1 style={{ fontSize: 24, marginBottom: 32, color: '#fff' }}>Reflections</h1>

      {count > 0 && (
        <div style={{
          textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 16,
        }}>
          {count} answered this session
        </div>
      )}

      <div style={{ position: 'relative' }}>
        {isExploring && (
          <div style={{
            position: 'absolute',
            left: 0,
            bottom: '100%',
            transform: 'translateY(-8px)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            font: "700 9px/1 'Space Mono', monospace",
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            padding: '5px 8px 5px 10px',
            borderRadius: 999,
            background: 'rgba(10, 24, 16, 0.85)',
            color: '#4ade80',
            border: '1px solid rgba(34, 197, 94, 0.45)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.35), 0 0 0 1px rgba(34,197,94,0.08)',
            backdropFilter: 'blur(6px)',
            whiteSpace: 'nowrap',
            zIndex: 2,
            animation: 'probeExploreBadgeIn 0.22s ease',
          }}>
            <Compass size={11} />
            EXPLORING · {exploreIntent!.catLabel} · {exploreIntent!.dimQueue.length} LEFT
            <button
              onClick={clearExplore}
              aria-label="Exit exploration"
              style={{
                background: 'none', border: 'none', color: '#4ade80',
                cursor: 'pointer', padding: '0 2px', fontSize: 12, lineHeight: 1,
                opacity: 0.7,
              }}
            >
              <X size={11} />
            </button>
          </div>
        )}

        <div style={{
          padding: '32px 28px', borderRadius: 16,
          background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${isExploring ? 'rgba(34,197,94,0.25)' : 'rgba(108,143,255,0.15)'}`,
          marginBottom: 32,
        }}>
          <div style={{ marginBottom: 20, textAlign: 'center' }}>
            <span style={{
              fontSize: 11, padding: '4px 12px', borderRadius: 12,
              background: 'rgba(108,143,255,0.12)', color: '#6c8fff',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              {catInfo?.label || probe.category}
            </span>
            {isExploring && exploreIntent!.dimQueue[0] && exploreIntent!.dimNames[exploreIntent!.dimQueue[0]] && (
              <div style={{
                fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 6,
                fontFamily: "'Space Mono', monospace",
              }}>
                Dimension: {exploreIntent!.dimNames[exploreIntent!.dimQueue[0]]}
              </div>
            )}
          </div>

          <div style={{
            fontSize: 18, lineHeight: 1.6, textAlign: 'center',
            color: 'rgba(255,255,255,0.9)', marginBottom: 32,
            fontStyle: 'italic',
          }}>
            "{probe.statement}"
          </div>

          <div style={{
            textAlign: 'center', fontSize: 16, fontWeight: 600,
            color: sliderColor(value), marginBottom: 16,
            transition: 'color 0.2s',
          }}>
            {getSemanticLabel(value)}
          </div>

          <input
            type="range"
            min={0} max={100} step={1}
            value={Math.round(value * 100)}
            onChange={e => { setValue(parseInt(e.target.value, 10) / 100); handleActivity(); }}
            aria-label="How true is this statement, on a scale from 0 (absolutely false) to 100 (absolutely true)"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(value * 100)}
            aria-valuetext={`${Math.round(value * 100)} — ${getSemanticLabel(value)}`}
            style={{
              width: '100%', cursor: 'pointer',
              accentColor: sliderColor(value),
            }}
          />

          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4,
          }}>
            <span>Absolute False</span>
            <span>Uncertain</span>
            <span>Absolute True</span>
          </div>
        </div>
      </div>

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
          onClick={handleSkip}
          style={{
            padding: '12px 24px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)',
            background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Skip
        </button>
      </div>

      <style>{`
        @keyframes probeExploreBadgeIn {
          from { opacity: 0; transform: translateY(0); }
          to   { opacity: 1; transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
