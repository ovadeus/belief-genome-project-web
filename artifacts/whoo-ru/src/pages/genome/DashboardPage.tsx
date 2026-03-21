// Belief Genome dashboard — 4 tabs: Radar, Breakdown, History, DNA String
import { useState, useEffect } from 'react';
import { genomeApi } from '../../components/genome/GenomeAuthContext';
import RadarChart from '../../components/genome/RadarChart';
import BreakdownBars from '../../components/genome/BreakdownBars';
import HistoryList from '../../components/genome/HistoryList';
import DnaString from '../../components/genome/DnaString';

type Tab = 'radar' | 'breakdown' | 'history' | 'dna';

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>('radar');
  const [dna, setDna] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    genomeApi('/dna').then(r => r.json()).then(setDna).catch(() => {});
    genomeApi('/history').then(r => r.json()).then(setHistory).catch(() => {});
  }, []);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'radar', label: 'Radar' },
    { key: 'breakdown', label: 'Breakdown' },
    { key: 'history', label: 'History' },
    { key: 'dna', label: 'DNA String' },
  ];

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, marginBottom: 24, color: '#fff' }}>Belief Dashboard</h1>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 28, borderRadius: 8,
        background: 'rgba(255,255,255,0.04)', padding: 4,
      }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 6, border: 'none',
              background: tab === t.key ? 'rgba(108,143,255,0.2)' : 'transparent',
              color: tab === t.key ? '#6c8fff' : 'rgba(255,255,255,0.4)',
              fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{
        padding: '24px', borderRadius: 12,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        {!dna ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: 40 }}>
            Loading...
          </div>
        ) : (
          <>
            {tab === 'radar' && <RadarChart dimensionScores={dna.dimensionScores || {}} />}
            {tab === 'breakdown' && <BreakdownBars dimensionScores={dna.dimensionScores || {}} />}
            {tab === 'history' && <HistoryList history={history} />}
            {tab === 'dna' && (
              <DnaString
                dnaString={dna.dnaString}
                dimensionsCovered={dna.dimensionsCovered}
                totalResponses={dna.totalResponses}
                overallConfidence={dna.overallConfidence}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
