// Belief Evolution Timeline — replays the user's belief journey across time.
// Reads GET /api/genome/timeline (server-side replay; trust returned values).
import { useEffect, useMemo, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale,
  Tooltip, Legend, Filler,
} from 'chart.js';
import { useLocation } from 'wouter';
import { genomeApi, useGenomeAuth } from '../../components/genome/GenomeAuthContext';
import { SHEX } from '../../components/genome/genome-utils';
import { useThemeColors } from '../../hooks/use-theme-colors';

// Display lookup for the canonical 11-category schema. The page is
// schema-agnostic — keys are derived from the server response — but this
// map provides nice labels and a stable render order. Unknown keys (if the
// server ever introduces a new category) fall back to the raw key.
const CAT_DISPLAY: Record<string, { label: string; order: number }> = {
  epistemology:  { label: 'Epistemology',   order: 1 },
  spirituality:  { label: 'Spirituality',   order: 2 },
  morality:      { label: 'Morality',       order: 3 },
  politics:      { label: 'Politics',       order: 4 },
  social:        { label: 'Social',         order: 5 },
  economics:     { label: 'Economics',      order: 6 },
  science_tech:  { label: 'Science & Tech', order: 7 },
  education:     { label: 'Education',      order: 8 },
  health:        { label: 'Health',         order: 9 },
  psychology:    { label: 'Psychology',     order: 10 },
  relationships: { label: 'Relationships',  order: 11 },
};

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler);

type BucketName = 'auto' | 'day' | 'week' | 'month';

interface TimelineBucket {
  ts: string;
  totalResponses: number;
  newResponsesInBucket: number;
  dimensionsCovered: number;
  overallConfidence: number;
  dimensionScores: Record<string, number | null>;
  categoryAvgs: Record<string, number | null>;
  dnaString: string;
}

interface TimelineResponse {
  bucket: 'day' | 'week' | 'month';
  from: string | null;
  to: string | null;
  dimensions: { id: number; name: string; categoryKey: string }[];
  buckets: TimelineBucket[];
}

function dnaCharColor(ch: string, pos: number): string {
  if (pos <= 7) return '#3dd68c';
  if (pos <= 10) return '#00d2d3';
  if (pos <= 15) return '#f5a623';
  if (ch === '\u00B7' || ch === '.' || ch === '_') return 'var(--border-strong)';
  const n = parseInt(ch);
  if (isNaN(n)) return 'var(--text-muted)';
  return SHEX[n] || 'var(--text-muted)';
}

function formatBucketLabel(iso: string, bucketName: string): string {
  const d = new Date(iso);
  if (bucketName === 'day') return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  if (bucketName === 'month') return d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function EvolutionPage() {
  const { user } = useGenomeAuth();
  const [bucket, setBucket] = useState<BucketName>('auto');
  const [data, setData] = useState<TimelineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrubIdx, setScrubIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const playTimer = useRef<number | null>(null);
  const [, setLocation] = useLocation();

  // Fetch timeline whenever bucket changes (or retry is clicked)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    genomeApi(`/timeline?bucket=${bucket}`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then((d: TimelineResponse) => {
        if (cancelled) return;
        setData(d);
        setScrubIdx(Math.max(0, d.buckets.length - 1));
        setLoading(false);
      })
      .catch(e => {
        if (cancelled) return;
        setError(e.message || 'Failed to load timeline');
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [bucket, user?.id, reloadKey]);

  // Toggle play/pause; if at end, restart from beginning
  const togglePlay = () => {
    if (!data) return;
    if (!playing && scrubIdx >= data.buckets.length - 1) {
      setScrubIdx(0);
    }
    setPlaying(p => !p);
  };

  // Auto-advance scrubber
  useEffect(() => {
    if (!playing || !data || data.buckets.length < 2) return;
    playTimer.current = window.setInterval(() => {
      setScrubIdx(i => {
        const next = i + 1;
        if (next >= data.buckets.length) {
          setPlaying(false);
          return data.buckets.length - 1;
        }
        return next;
      });
    }, 600);
    return () => {
      if (playTimer.current) {
        clearInterval(playTimer.current);
        playTimer.current = null;
      }
    };
  }, [playing, data]);

  const labels = useMemo(
    () => data?.buckets.map(b => formatBucketLabel(b.ts, data.bucket)) || [],
    [data]
  );

  // Chart.js draws to canvas which can't read CSS variables. Resolve them to
  // literal colors here; the hook re-runs on theme switch.
  const c = useThemeColors([
    '--accent-bright',
    '--accent-soft',
    '--text-faint',
    '--text-secondary',
    '--text-ghost',
    '--surface-2',
    '--panel-glass-bg',
    '--accent-mid',
  ] as const);

  const overallChartData = useMemo(() => {
    if (!data) return null;
    return {
      labels,
      datasets: [
        {
          label: 'Confidence (%)',
          data: data.buckets.map(b => b.overallConfidence),
          borderColor: c['--accent-bright'],
          backgroundColor: c['--accent-soft'],
          tension: 0.3,
          fill: true,
          yAxisID: 'y',
          pointRadius: 2,
        },
        {
          label: 'Dimensions Covered',
          data: data.buckets.map(b => b.dimensionsCovered),
          borderColor: '#3dd68c',
          backgroundColor: 'rgba(61, 214, 140, 0.0)',
          tension: 0.3,
          fill: false,
          yAxisID: 'y1',
          pointRadius: 2,
        },
      ],
    };
  }, [data, labels, c]);

  const overallChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    scales: {
      x: { ticks: { color: c['--text-faint'], maxRotation: 0, autoSkip: true, maxTicksLimit: 10 }, grid: { color: c['--surface-2'] } },
      y: { type: 'linear' as const, position: 'left' as const, min: 0, max: 100, ticks: { color: c['--text-faint'] }, grid: { color: c['--surface-2'] }, title: { display: true, text: 'Confidence %', color: c['--text-faint'] } },
      y1: { type: 'linear' as const, position: 'right' as const, min: 0, max: 124, ticks: { color: c['--text-faint'] }, grid: { drawOnChartArea: false }, title: { display: true, text: 'Dimensions', color: c['--text-faint'] } },
    },
    plugins: {
      legend: { labels: { color: c['--text-secondary'], font: { size: 12 } } },
      tooltip: { backgroundColor: c['--panel-glass-bg'], borderColor: c['--accent-mid'], borderWidth: 1 },
    },
  }), [c]);

  // ── Render branches ────────────────────────────────────────
  if (loading && !data) {
    return (
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: 32, color: 'var(--text-muted)' }}>
        Loading timeline…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: 32 }}>
        <h1 style={{ fontSize: 24, color: 'var(--text-primary)', marginBottom: 16 }}>Evolution</h1>
        <div style={{ padding: 20, borderRadius: 12, background: 'var(--surface-1)', border: '1px solid #ff6b6b40', color: '#ff6b6b' }}>
          {error}
          <button
            onClick={() => setReloadKey(k => k + 1)}
            style={{ marginLeft: 16, padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border-soft)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data || data.buckets.length < 2) {
    return (
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: 32 }}>
        <h1 style={{ fontSize: 24, color: 'var(--text-primary)', marginBottom: 16 }}>Evolution</h1>
        <div style={{ padding: 32, borderRadius: 12, background: 'var(--surface-1)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
            Answer a few more reflections to see your Genome evolve over time.
          </p>
          <button
            onClick={() => setLocation('/probe')}
            style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--accent-bright)', color: 'var(--text-primary)', border: 'none', fontSize: 14, cursor: 'pointer' }}
          >
            Open Reflections
          </button>
        </div>
      </div>
    );
  }

  const currentBucket = data.buckets[Math.min(scrubIdx, data.buckets.length - 1)];

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 32px 48px' }}>
      {/* Header + bucket selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h1 style={{ fontSize: 24, color: 'var(--text-primary)', margin: 0 }}>Evolution</h1>
        <div style={{ display: 'flex', border: '1px solid var(--border-soft)', borderRadius: 8, overflow: 'hidden' }}>
          {(['day', 'week', 'month', 'auto'] as BucketName[]).map(b => (
            <button
              key={b}
              onClick={() => setBucket(b)}
              aria-pressed={bucket === b}
              aria-label={`Group by ${b}`}
              style={{
                padding: '6px 14px', border: 'none',
                background: bucket === b ? 'var(--accent-bright)' : 'transparent',
                color: bucket === b ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: 12, cursor: 'pointer', textTransform: 'capitalize', letterSpacing: '0.03em',
              }}
            >
              {b}
            </button>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 24 }}>
        {data.buckets.length} {data.buckets.length === 1 ? 'bucket' : 'buckets'} ({bucket === 'auto' ? `Auto — ~${data.bucket}ly` : data.bucket}) · {currentBucket.totalResponses} reflections to date
      </div>

      {/* Top: overall confidence + coverage */}
      <div style={{ padding: 20, borderRadius: 12, background: 'var(--surface-1)', border: '1px solid var(--border-subtle)', marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>Overall Confidence & Coverage</h3>
        <div style={{ height: 280 }}>
          {overallChartData && <Line data={overallChartData} options={overallChartOptions as any} />}
        </div>
      </div>

      {/* Middle: category sparklines */}
      <div style={{ padding: 20, borderRadius: 12, background: 'var(--surface-1)', border: '1px solid var(--border-subtle)', marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>By Category</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {Object.keys(data.buckets[data.buckets.length - 1]?.categoryAvgs ?? {})
            .sort((a, b) => (CAT_DISPLAY[a]?.order ?? 999) - (CAT_DISPLAY[b]?.order ?? 999))
            .map(catKey => {
            const series = data.buckets.map(b => b.categoryAvgs[catKey]);
            const hasData = series.some(v => v !== null);
            const sparkData = {
              labels,
              datasets: [{
                data: series,
                borderColor: hasData ? c['--accent-bright'] : c['--text-ghost'],
                backgroundColor: c['--accent-soft'],
                fill: true,
                tension: 0.35,
                pointRadius: 0,
                spanGaps: false,
                borderWidth: 1.5,
              }],
            };
            const sparkOpts = {
              responsive: true,
              maintainAspectRatio: false,
              animation: false as const,
              plugins: { legend: { display: false }, tooltip: { enabled: false } },
              scales: {
                x: { display: false },
                y: { display: false, min: 0, max: 9 },
              },
              elements: { line: { borderJoinStyle: 'round' as const } },
            };
            const latest = series.slice().reverse().find(v => v !== null);
            return (
              <div key={catKey} style={{ padding: 12, borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {CAT_DISPLAY[catKey]?.label || catKey}
                  </div>
                  <div style={{ fontSize: 11, color: hasData ? 'var(--accent-bright)' : 'var(--text-faint)', fontFamily: 'monospace' }}>
                    {latest != null ? latest.toFixed(2) : '—'}
                  </div>
                </div>
                <div style={{ height: 40 }}>
                  <Line data={sparkData as any} options={sparkOpts as any} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom: scrubber + DNA snapshot */}
      <div style={{ padding: 20, borderRadius: 12, background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>DNA Snapshot</h3>
          <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>
            {new Date(currentBucket.ts).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            {' · '}{currentBucket.totalResponses} reflections · {currentBucket.dimensionsCovered}/124 dimensions · {currentBucket.overallConfidence}% confidence
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
          <button
            onClick={togglePlay}
            aria-label={playing ? 'Pause timeline playback' : 'Play timeline from current position'}
            style={{
              padding: '8px 16px', borderRadius: 6, border: 'none',
              background: 'var(--accent-bright)', color: 'var(--text-primary)',
              fontSize: 12, cursor: 'pointer', minWidth: 72,
            }}
          >
            {playing ? 'Pause' : 'Play'}
          </button>
          <input
            type="range"
            min={0}
            max={data.buckets.length - 1}
            value={scrubIdx}
            onChange={e => { setPlaying(false); setScrubIdx(parseInt(e.target.value, 10)); }}
            aria-label={`Timeline scrubber, bucket ${scrubIdx + 1} of ${data.buckets.length}, dated ${new Date(currentBucket.ts).toLocaleDateString()}`}
            aria-valuemin={0}
            aria-valuemax={data.buckets.length - 1}
            aria-valuenow={scrubIdx}
            style={{ flex: 1 }}
          />
          <div style={{ fontSize: 11, color: 'var(--text-faint)', fontFamily: 'monospace', minWidth: 64, textAlign: 'right' }}>
            {scrubIdx + 1}/{data.buckets.length}
          </div>
        </div>

        <div style={{
          fontFamily: 'monospace', fontSize: 14, letterSpacing: 2.5, lineHeight: 2,
          wordBreak: 'break-all', textAlign: 'center',
          padding: '16px 20px', borderRadius: 10,
          background: 'var(--surface-2)', border: '1px solid var(--accent-soft)',
          transition: 'opacity 200ms',
        }}>
          {currentBucket.dnaString.split('').map((ch, i) => (
            <span key={i} style={{ color: dnaCharColor(ch, i) }}>{ch}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
