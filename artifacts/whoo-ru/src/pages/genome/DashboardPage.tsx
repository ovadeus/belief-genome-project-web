// Belief Genome Dashboard — 6 tabs matching desktop exactly
// Triple Helix | Radar | Breakdown | Timeline | History | Forecaster
// + Stats row + DNA String & Analyse buttons
import { useState, useEffect, useCallback } from 'react';
import { genomeApi } from '../../components/genome/GenomeAuthContext';
import TripleHelix from '../../components/genome/TripleHelix';
import RadarChart from '../../components/genome/RadarChart';
import BreakdownBars from '../../components/genome/BreakdownBars';
import Timeline from '../../components/genome/Timeline';
import HistoryList from '../../components/genome/HistoryList';
import Forecaster from '../../components/genome/Forecaster';
import DnaString from '../../components/genome/DnaString';

type Tab = 'helix' | 'radar' | 'breakdown' | 'timeline' | 'history' | 'forecaster';

const TABS: { key: Tab; icon: string; label: string }[] = [
  { key: 'helix',      icon: '\u2728', label: 'Triple Helix' },
  { key: 'radar',      icon: '\u25CE', label: 'Radar' },
  { key: 'breakdown',  icon: '\u2502', label: 'Breakdown' },
  { key: 'timeline',   icon: '\u223F', label: 'Timeline' },
  { key: 'history',    icon: '\u2630', label: 'History' },
  { key: 'forecaster', icon: '\u2699', label: 'Forecaster' },
];

/* ── Helper: day streak ─────────────────────────────────────── */
function calcStreak(history: any[]): number {
  if (!history.length) return 0;
  const days = new Set(history.map(h => new Date(h.createdAt).toDateString()));
  let streak = 0;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (days.has(d.toDateString())) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>('helix');
  const [dna, setDna] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [dimensions, setDimensions] = useState<any[]>([]);
  const [showDnaModal, setShowDnaModal] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [analysis, setAnalysis] = useState('');

  useEffect(() => {
    genomeApi('/dna').then(r => r.json()).then(setDna).catch(() => {});
    genomeApi('/history?limit=200').then(r => r.json()).then(setHistory).catch(() => {});
    genomeApi('/dimensions').then(r => r.json()).then(d => {
      setDimensions(d.dimensions || []);
    }).catch(() => {});
  }, []);

  const runAnalysis = useCallback(async () => {
    setAnalysing(true);
    try {
      const res = await genomeApi('/analyse', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data.analysis || 'Analysis complete.');
      }
    } catch {}
    setAnalysing(false);
  }, []);

  // Stats
  const totalResponses = history.length;
  const cats = [...new Set(history.map((h: any) => h.probeCategory).filter(Boolean))].length;
  const streak = calcStreak(history);
  const newsProbes = history.filter((h: any) => (h.probeSource || '').startsWith('news:')).length;
  const avgAgreement = totalResponses > 0
    ? Math.round((history.reduce((s: number, h: any) => s + h.value, 0) / totalResponses) * 100)
    : 0;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: 0 }}>Belief Genome</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>
            Mapping your cognitive DNA — one reflection at a time
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowDnaModal(!showDnaModal)} style={headerBtnStyle}>
            <span style={{ fontSize: 12 }}>{'\u2728'}</span> DNA String
          </button>
          <button onClick={runAnalysis} disabled={analysing} style={headerBtnStyle}>
            <span style={{ fontSize: 12 }}>{'\u2728'}</span> {analysing ? 'Analysing...' : 'Analyse'}
          </button>
        </div>
      </div>

      {/* Analysis result */}
      {analysis && (
        <div style={{
          padding: 16, borderRadius: 8, marginBottom: 16,
          background: 'rgba(108,143,255,0.06)', border: '1px solid rgba(108,143,255,0.15)',
          fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6,
        }}>
          {analysis}
        </div>
      )}

      {/* Stats row */}
      <div style={{
        display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap',
      }}>
        {[
          { num: totalResponses, label: 'Responses' },
          { num: cats, label: 'Categories' },
          { num: streak, label: 'Day Streak' },
          { num: newsProbes, label: 'News Probes' },
          { num: `${avgAgreement}%`, label: 'Avg Agreement' },
        ].map((s, i) => (
          <div key={i} style={{
            flex: 1, minWidth: 90, padding: '12px 16px', textAlign: 'center',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10,
          }}>
            <div style={{
              fontSize: 22, fontWeight: 700, color: '#6c8fff',
              fontFamily: "'Space Mono', monospace",
            }}>
              {s.num}
            </div>
            <div style={{
              fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2,
              fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap',
      }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '8px 16px', borderRadius: 8,
              background: tab === t.key ? 'rgba(108,143,255,0.2)' : 'transparent',
              color: tab === t.key ? '#6c8fff' : 'rgba(255,255,255,0.4)',
              fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: 6,
              fontWeight: tab === t.key ? 600 : 400,
              border: tab === t.key ? '1px solid rgba(108,143,255,0.3)' : '1px solid transparent',
            }}
          >
            <span style={{ fontSize: 14 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{
        padding: 24, borderRadius: 12,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        minHeight: 300,
      }}>
        {!dna && tab !== 'forecaster' ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: 60 }}>
            Loading...
          </div>
        ) : (
          <>
            {tab === 'helix' && (
              <TripleHelix
                dimensions={dimensions}
                dimensionScores={dna?.dimensionScores || {}}
                confidence={dna?.confidence || {}}
              />
            )}
            {tab === 'radar' && <RadarChart history={history} />}
            {tab === 'breakdown' && <BreakdownBars history={history} />}
            {tab === 'timeline' && <Timeline history={history} />}
            {tab === 'history' && <HistoryList history={history} />}
            {tab === 'forecaster' && <Forecaster history={history} />}
          </>
        )}
      </div>

      {/* DNA String Modal */}
      {showDnaModal && dna && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20,
        }} onClick={() => setShowDnaModal(false)}>
          <div
            style={{
              maxWidth: 700, width: '100%', padding: 32, borderRadius: 16,
              background: '#0a0a0f', border: '1px solid rgba(108,143,255,0.2)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
            }}>
              <h2 style={{ fontSize: 18, color: '#fff', margin: 0 }}>Belief DNA String</h2>
              <button onClick={() => setShowDnaModal(false)} style={{
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
                fontSize: 20, cursor: 'pointer',
              }}>&times;</button>
            </div>
            <DnaString
              dnaString={dna.dnaString}
              dimensionsCovered={dna.dimensionsCovered}
              totalResponses={dna.totalResponses}
              overallConfidence={dna.overallConfidence}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const headerBtnStyle: React.CSSProperties = {
  padding: '8px 16px', borderRadius: 8,
  background: 'transparent', border: '1px solid rgba(108,143,255,0.3)',
  color: 'rgba(255,255,255,0.6)', fontSize: 12, cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: 6,
  fontFamily: "'Space Mono', monospace",
  transition: 'all 0.2s',
};
