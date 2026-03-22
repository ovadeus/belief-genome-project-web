// Dedicated Belief DNA page — full-screen DNA string viewer with stats
import { useState, useEffect } from 'react';
import { genomeApi } from '../../components/genome/GenomeAuthContext';
import DnaString from '../../components/genome/DnaString';

export default function DnaPage() {
  const [dna, setDna] = useState<any>(null);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    genomeApi('/dna').then(r => r.json()).then(setDna).catch(() => {});
  }, []);

  const copyDna = async () => {
    if (!dna?.dnaString) return;
    try {
      await navigator.clipboard.writeText(dna.dnaString);
      setCopying(true);
      setTimeout(() => setCopying(false), 2000);
    } catch {}
  };

  if (!dna) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.3)' }}>
        Loading Belief DNA...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 24,
      }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 }}>Belief DNA</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>
            Your 140-character cognitive fingerprint
          </p>
        </div>
        <button onClick={copyDna} style={{
          padding: '8px 16px', borderRadius: 8,
          background: copying ? 'rgba(46,213,115,0.15)' : 'transparent',
          border: `1px solid ${copying ? 'rgba(46,213,115,0.3)' : 'rgba(108,143,255,0.3)'}`,
          color: copying ? '#2ed573' : 'rgba(255,255,255,0.6)',
          fontSize: 12, cursor: 'pointer',
          fontFamily: "'Space Mono', monospace",
        }}>
          {copying ? 'Copied!' : 'Copy DNA String'}
        </button>
      </div>

      {/* Main DNA display */}
      <div style={{
        padding: 28, borderRadius: 16,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(108,143,255,0.12)',
        marginBottom: 24,
      }}>
        <DnaString
          dnaString={dna.dnaString}
          dimensionsCovered={dna.dimensionsCovered}
          totalResponses={dna.totalResponses}
          overallConfidence={dna.overallConfidence}
        />
      </div>

      {/* How it works */}
      <div style={{
        padding: 20, borderRadius: 12,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <h3 style={{
          fontSize: 11, fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
          letterSpacing: 1.5, color: 'rgba(255,255,255,0.4)', marginBottom: 16,
        }}>
          How Your DNA String Works
        </h3>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
          fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6,
        }}>
          <div>
            <strong style={{ color: '#3dd68c' }}>Positions 0-7: Identity</strong>
            <p>Century, birth year, month, day, and gender — your demographic metadata.</p>
          </div>
          <div>
            <strong style={{ color: '#00d2d3' }}>Positions 8-10: Country</strong>
            <p>ISO 3166-1 numeric country code (e.g. 840, 826, 392). Defaults to 000.</p>
          </div>
          <div>
            <strong style={{ color: '#f5a623' }}>Positions 11-15: Zip/Postal</strong>
            <p>5-character postal code for geographic belief analysis. Defaults to 00000.</p>
          </div>
          <div>
            <strong style={{ color: '#6c8fff' }}>Positions 16-139: Beliefs</strong>
            <p>124 belief dimensions scored 0-9. Each dot ({'\u00B7'}) is an unexplored dimension.</p>
          </div>
        </div>
        <div style={{
          marginTop: 16, padding: 12, borderRadius: 8,
          background: 'rgba(108,143,255,0.06)',
          fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6,
        }}>
          <strong style={{ color: '#6c8fff' }}>Scoring Scale:</strong>{' '}
          <span style={{ color: '#dc3232' }}>0 = False to me</span> {' → '}
          <span style={{ color: '#ff7728' }}>3 = Unlikely true</span> {' → '}
          <span style={{ color: '#787891' }}>5 = Uncertain</span> {' → '}
          <span style={{ color: '#3cb4b4' }}>7 = Likely true</span> {' → '}
          <span style={{ color: '#50b4ff' }}>9 = Deeply true to me</span>
        </div>
      </div>
    </div>
  );
}
