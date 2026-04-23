// Dedicated Belief DNA page — full-screen DNA string viewer with stats
import { useRef, useState } from 'react';
import DnaString from '../../components/genome/DnaString';
import DnaStrip from '../../components/genome/DnaStrip';
import ShareDnaModal from '../../components/genome/ShareDnaModal';
import ExportBgpModal from '../../components/genome/ExportBgpModal';
import LineageDrawer from '../../components/genome/LineageDrawer';
import { useDNA, useDimensions } from '../../hooks/use-genome';
import { useGenomeAuth } from '../../components/genome/GenomeAuthContext';
import { toast } from 'sonner';

export default function DnaPage() {
  const dnaQ = useDNA();
  const dimsQ = useDimensions();
  const { user } = useGenomeAuth();
  const [copying, setCopying] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [lineageDimId, setLineageDimId] = useState<number | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  const dna = dnaQ.data;
  const dims = dimsQ.data?.dimensions ?? [];

  const copyDna = async () => {
    if (!dna?.dnaString) return;
    try {
      await navigator.clipboard.writeText(dna.dnaString);
      setCopying(true);
      setTimeout(() => setCopying(false), 2000);
    } catch {}
  };

  const downloadPng = async () => {
    if (!stripRef.current || downloading) return;
    setDownloading(true);
    try {
      // Dynamic import keeps html-to-image out of the initial bundle.
      const { toPng } = await import('html-to-image');
      // Resolve current theme background to a concrete color for PNG export.
      const bgHsl = getComputedStyle(document.documentElement)
        .getPropertyValue('--background').trim();
      const exportBg = bgHsl ? `hsl(${bgHsl})` : '#0a0a14';
      const dataUrl = await toPng(stripRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: exportBg,
      });
      const link = document.createElement('a');
      link.download = `belief-dna-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('DNA image downloaded');
    } catch (err) {
      toast.error("Couldn't generate image");
      // eslint-disable-next-line no-console
      console.error('PNG export failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (dnaQ.isLoading || dimsQ.isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-faint)' }}>
        Loading Belief DNA...
      </div>
    );
  }

  if (dnaQ.isError || dimsQ.isError || !dna) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
        <p style={{ marginBottom: 16 }}>Couldn't load your Belief DNA.</p>
        <button
          onClick={() => { dnaQ.refetch(); dimsQ.refetch(); }}
          style={{
            padding: '8px 20px', borderRadius: 8,
            background: 'transparent', border: '1px solid var(--accent-strong)',
            color: 'var(--accent-bright)', fontSize: 13, cursor: 'pointer',
          }}
        >
          Retry
        </button>
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
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Belief DNA</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Click a gray cell to explore. Click a colored cell to see its lineage.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setShareOpen(true)} style={{
            padding: '8px 14px', borderRadius: 8,
            background: 'var(--accent-mid)',
            border: '1px solid var(--accent-strong)',
            color: 'var(--accent-text)',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>Share</button>
          <button onClick={() => setExportOpen(true)} style={{
            padding: '8px 14px', borderRadius: 8,
            background: 'transparent',
            border: '1px solid var(--accent-mid)',
            color: 'var(--text-secondary)',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>Export .bgp</button>
          <button onClick={downloadPng} disabled={downloading} style={{
            padding: '8px 14px', borderRadius: 8,
            background: 'transparent',
            border: '1px solid var(--accent-mid)',
            color: 'var(--text-secondary)',
            fontSize: 12, fontWeight: 600,
            cursor: downloading ? 'wait' : 'pointer',
            opacity: downloading ? 0.6 : 1,
          }}>{downloading ? 'Rendering…' : 'Download PNG'}</button>
          <button onClick={copyDna} style={{
            padding: '8px 14px', borderRadius: 8,
            background: copying ? 'rgba(46,213,115,0.15)' : 'transparent',
            border: `1px solid ${copying ? 'rgba(46,213,115,0.3)' : 'var(--accent-mid)'}`,
            color: copying ? '#22c55e' : 'var(--text-secondary)',
            fontSize: 12, cursor: 'pointer',
            fontFamily: "'Space Mono', monospace",
          }}>
            {copying ? 'Copied!' : 'Copy String'}
          </button>
        </div>
      </div>

      {/* Visual DNA Strip — ref'd for PNG export. The export captures only
          this element so demographics text outside it is never included. */}
      <div ref={stripRef} style={{
        padding: 24, borderRadius: 16,
        background: 'var(--surface-1)',
        border: '1px solid var(--accent-soft)',
        marginBottom: 24,
      }}>
        <DnaStrip
          dimensions={dims}
          dimensionScores={dna.dimensionScores ?? {}}
          confidence={dna.dimensionConfidence ?? {}}
          totalResponses={dna.totalResponses}
          dimensionsCovered={dna.dimensionsCovered}
          overallConfidence={dna.overallConfidence}
          onExploredClick={(dimId) => setLineageDimId(dimId)}
        />
      </div>

      {/* Text DNA display */}
      <div style={{
        padding: 28, borderRadius: 16,
        background: 'var(--surface-1)',
        border: '1px solid var(--accent-soft)',
        marginBottom: 24,
      }}>
        <DnaString
          dnaString={dna.dnaString}
          dimensionsCovered={dna.dimensionsCovered}
          totalResponses={dna.totalResponses}
          overallConfidence={dna.overallConfidence}
        />
      </div>

      <LineageDrawer
        dimensionId={lineageDimId}
        open={lineageDimId !== null}
        onOpenChange={(o) => { if (!o) setLineageDimId(null); }}
      />

      <ShareDnaModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        dnaString={dna.dnaString}
      />
      <ExportBgpModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        dnaString={dna.dnaString}
        defaultName={user?.name ?? null}
      />

      {/* How it works */}
      <div style={{
        padding: 20, borderRadius: 12,
        background: 'var(--surface-1)',
        border: '1px solid var(--border-subtle)',
      }}>
        <h3 style={{
          fontSize: 11, fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
          letterSpacing: 1.5, color: 'var(--text-muted)', marginBottom: 16,
        }}>
          How Your DNA String Works
        </h3>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
          fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6,
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
            <strong style={{ color: 'var(--accent-bright)' }}>Positions 16-139: Beliefs</strong>
            <p>124 belief dimensions scored 0-9. Each dot ({'\u00B7'}) is an unexplored dimension.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
