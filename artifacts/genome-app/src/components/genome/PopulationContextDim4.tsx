// Population Context — Dim 4 (Objective Reality Exists)
//
// Frontiers paper Section 6.5 worked example. Renders the five Phase-1
// baseline strata as horizontal bars showing the |q| QQ-magnitude per
// stratum, with the midpoint stratum highlighted (the paper's predicted-
// distinct stratum where the superposition signature should peak).
//
// Data source: GET /api/belief/qq-stats?dim=4. Strata with insufficient
// population are rendered greyed out with a "not enough data" note —
// they're preserved in the layout so the user sees the full five-bin
// design even before any one bin is filled.

import { useEffect, useState } from 'react';

// /api/belief/* lives outside the /api/genome/* namespace handled by
// genomeApi, so we use plain fetch with the same base-URL convention.
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

type StratumId =
  | 'resolved-low'
  | 'near-midpoint-low'
  | 'midpoint'
  | 'near-midpoint-high'
  | 'resolved-high';

interface StratumPayload {
  stratum: StratumId;
  qq_magnitude: number | null;
  sample_size: number;
  order1_n: number;
  order2_n: number;
  sufficient: boolean;
  reason?: string;
  distinct_users?: number;
}

interface QQStatsResponse {
  ok: boolean;
  dim_id: number;
  strata: Record<StratumId, StratumPayload>;
  total_pair_complete: number;
  computed_at: string;
  privacy?: { min_users_per_stratum: number };
}

const STRATUM_ORDER: StratumId[] = [
  'resolved-low',
  'near-midpoint-low',
  'midpoint',
  'near-midpoint-high',
  'resolved-high',
];

const STRATUM_LABELS: Record<StratumId, string> = {
  'resolved-low':       'Resolved low (1–3)',
  'near-midpoint-low':  'Near-midpoint low (4)',
  'midpoint':           'Superposition (5)',
  'near-midpoint-high': 'Near-midpoint high (6)',
  'resolved-high':      'Resolved high (7–9)',
};

// Horizontal-bar scale: |q| is in [0, 1]. Visually we cap at 0.5 because
// real QQ magnitudes above that signal extreme classical-style violations
// and would compress the rest of the chart into invisibility.
const Q_DISPLAY_CAP = 0.5;

export default function PopulationContextDim4() {
  const [data, setData] = useState<QQStatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    // Use the same authenticated genomeApi helper used elsewhere on the
    // dashboard. The /belief route is unauthenticated for now, but routing
    // through the helper keeps base-URL handling consistent across artifacts.
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/belief/qq-stats?dim=4`, {
          method: 'GET',
          credentials: 'include',
        });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok || json?.ok === false) {
          setError(json?.error || `HTTP ${res.status}`);
          setData(null);
        } else {
          setData(json as QQStatsResponse);
        }
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || 'Network error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{
      background: '#0d0f12',
      border: '1px solid #1f2329',
      borderRadius: 12,
      padding: '20px 24px',
      margin: '24px 0',
      color: '#cbd5e1',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 4 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#e2e8f0', margin: 0 }}>
          Population Context — Dim 4 (Objective Reality Exists)
        </h3>
        {data?.total_pair_complete != null && (
          <span style={{ fontSize: 12, color: '#64748b' }}>
            n={data.total_pair_complete} paired
          </span>
        )}
      </div>
      <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 16px' }}>
        QQ-equality magnitude per Phase 1 baseline stratum. The midpoint
        stratum is the paper's predicted-distinct band — superposition
        respondents should show a higher |q| than their resolved neighbours.
      </p>

      {loading && (
        <div style={{ fontSize: 13, color: '#64748b', padding: '12px 0' }}>Loading…</div>
      )}
      {error && !loading && (
        <div style={{ fontSize: 13, color: '#f87171', padding: '12px 0' }}>{error}</div>
      )}
      {data && !loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {STRATUM_ORDER.map(id => {
            const s = data.strata[id];
            const isMidpoint = id === 'midpoint';
            const ratio = s?.qq_magnitude != null
              ? Math.min(1, s.qq_magnitude / Q_DISPLAY_CAP)
              : 0;
            return (
              <div key={id} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 80px', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 13, color: isMidpoint ? '#fbbf24' : '#94a3b8', fontWeight: isMidpoint ? 600 : 400 }}>
                  {STRATUM_LABELS[id]}
                </span>
                <div style={{ position: 'relative', height: 14, background: '#15181d', borderRadius: 4, overflow: 'hidden' }}>
                  {s?.sufficient && s.qq_magnitude != null && (
                    <div style={{
                      position: 'absolute', top: 0, left: 0, bottom: 0,
                      width: `${ratio * 100}%`,
                      background: isMidpoint ? '#fbbf24' : '#3b82f6',
                      transition: 'width 200ms ease',
                    }} />
                  )}
                </div>
                <span style={{ fontSize: 12, textAlign: 'right', color: '#64748b' }}>
                  {s?.sufficient && s.qq_magnitude != null
                    ? `|q|=${s.qq_magnitude.toFixed(3)}`
                    : (s?.distinct_users != null
                        ? `n=${s.distinct_users} users`
                        : '—')}
                </span>
              </div>
            );
          })}
          <p style={{ fontSize: 11, color: '#475569', margin: '8px 0 0' }}>
            Strata with fewer than {data.privacy?.min_users_per_stratum ?? 5}{' '}
            distinct respondents are suppressed for privacy.
          </p>
        </div>
      )}
    </div>
  );
}
