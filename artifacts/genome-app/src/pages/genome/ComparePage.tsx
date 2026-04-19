// One page, two visual modes:
//   /dna/compare           → library mode (import + list)
//   /dna/compare/:entryId  → compare mode (yours vs theirs, agreement coloring)
// The library list + import dropzone stay rendered above the comparison so
// switching targets is one click — no route reload required.

import { useMemo, useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import DnaStrip from '../../components/genome/DnaStrip';
import DnaStripSkeleton from '../../components/genome/DnaStripSkeleton';
import ImportBgpDropzone, { FormatBadge } from '../../components/genome/ImportBgpDropzone';
import KnownDnasList from '../../components/genome/KnownDnasList';
import { useDimensions } from '../../hooks/use-genome';
import { useCompare, useKnownDnas, type AgreementBucket } from '../../hooks/use-known-dnas';
import { BELIEF_LABELS_10, SHEX } from '../../components/genome/genome-utils';

const BUCKET_COLOR: Record<AgreementBucket, string> = {
  strong:      '#22c55e',
  mild:        '#facc15',
  moderate:    '#fb923c',
  strong_diff: '#dc2626',
  none:        'rgba(255,255,255,0.15)',
};

const BUCKET_LABEL: Record<AgreementBucket, string> = {
  strong:      'Strong agreement',
  mild:        'Mild divergence',
  moderate:    'Moderate divergence',
  strong_diff: 'Strong divergence',
  none:        'One side unexplored',
};

const BUCKET_COPY: Record<AgreementBucket, string> = {
  strong:      'You both land in essentially the same place on this dimension.',
  mild:        "You're close but not identical — a small but real difference.",
  moderate:    'A meaningful gap. Worth talking about if it matters to you.',
  strong_diff: 'You see this dimension very differently. This is where conversation lives.',
  none:        "One of you hasn't explored this dimension yet. No comparison possible.",
};

export default function ComparePage() {
  const [, navigate] = useLocation();
  const [matchEntry, params] = useRoute('/dna/compare/:entryId');
  const entryId = matchEntry && params?.entryId ? parseInt(params.entryId, 10) : null;
  const validEntryId = entryId != null && !isNaN(entryId) ? entryId : null;

  const dimsQ = useDimensions();
  const compareQ = useCompare(validEntryId);
  const libQ = useKnownDnas();

  const [selectedDimId, setSelectedDimId] = useState<number | null>(null);

  // Reset selected cell whenever we switch which entry we're comparing against.
  useEffect(() => { setSelectedDimId(null); }, [validEntryId]);

  // Auto-redirect ONLY when the server has explicitly told us the entry is
  // gone (compare query returned not_found) AND the library list has settled.
  // Don't redirect just because the library doesn't yet contain the entry —
  // that would race against a stale library cache and bounce the user back
  // to /dna/compare on every navigation that beats the list refetch.
  useEffect(() => {
    if (validEntryId == null) return;
    const compareNotFound = compareQ.isError && (compareQ.error as Error)?.message === 'not_found';
    if (compareNotFound && !libQ.isLoading) {
      navigate('/dna/compare');
    }
  }, [validEntryId, compareQ.isError, compareQ.error, libQ.isLoading, navigate]);

  const colorOverride = useMemo(() => {
    const map: Record<number, string> = {};
    if (!compareQ.data) return map;
    for (const [dimIdStr, perDim] of Object.entries(compareQ.data.comparison.perDim)) {
      map[parseInt(dimIdStr, 10)] = BUCKET_COLOR[perDim.agreement];
    }
    return map;
  }, [compareQ.data]);

  const dims = dimsQ.data?.dimensions ?? [];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 }}>Compare</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>
          Import another person's Belief DNA, then see where you agree and diverge.
        </p>
      </div>

      {/* Two-column on wide, stacked on narrow */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(280px, 1fr)', gap: 20, marginBottom: 28 }}>
        <section>
          <h2 style={sectionLabel}>Import a DNA</h2>
          <ImportBgpDropzone />
        </section>
        <section>
          <h2 style={sectionLabel}>Your Library</h2>
          <KnownDnasList
            selectedId={validEntryId}
            onSelect={(e) => navigate(`/dna/compare/${e.id}`)}
          />
        </section>
      </div>

      {/* Compare mode panel */}
      {validEntryId != null && (
        <section style={{
          padding: 24, borderRadius: 16,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(108,143,255,0.18)',
        }}>
          {compareQ.isLoading && <DnaStripSkeleton message="Computing alignment…" />}

          {compareQ.isError && (() => {
            const msg = (compareQ.error as Error)?.message || '';
            const headline =
              msg === 'not_found'    ? "That entry is no longer in your library." :
              msg === 'rate_limited' ? 'Too many compare requests — wait a moment, then try again.' :
                                       "Couldn't load this comparison.";
            return (
              <div style={{ textAlign: 'center', padding: 20, color: 'rgba(255,255,255,0.5)' }}>
                <p style={{ marginBottom: 12 }}>{headline}</p>
                <div style={{ display: 'inline-flex', gap: 8 }}>
                  {msg !== 'not_found' && (
                    <button
                      onClick={() => compareQ.refetch()}
                      style={{
                        padding: '8px 16px', borderRadius: 8,
                        background: 'rgba(108,143,255,0.15)',
                        border: '1px solid rgba(108,143,255,0.4)',
                        color: '#a8c0ff', fontSize: 12, cursor: 'pointer',
                      }}
                    >
                      Try again
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/dna/compare')}
                    style={{
                      padding: '8px 16px', borderRadius: 8,
                      background: 'transparent', border: '1px solid rgba(108,143,255,0.4)',
                      color: '#6c8fff', fontSize: 12, cursor: 'pointer',
                    }}
                  >
                    Back to library
                  </button>
                </div>
              </div>
            );
          })()}

          {compareQ.data && (
            <CompareView
              data={compareQ.data}
              dims={dims}
              colorOverride={colorOverride}
              selectedDimId={selectedDimId}
              onSelectDim={setSelectedDimId}
              onClose={() => navigate('/dna/compare')}
            />
          )}
        </section>
      )}
    </div>
  );
}

const sectionLabel: React.CSSProperties = {
  fontSize: 11, fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
  letterSpacing: 1.5, color: 'rgba(255,255,255,0.5)',
  margin: '0 0 12px',
};

function CompareView({
  data, dims, colorOverride, selectedDimId, onSelectDim, onClose,
}: {
  data: NonNullable<ReturnType<typeof useCompare>['data']>;
  dims: { id: number; cat: string; name: string }[];
  colorOverride: Record<number, string>;
  selectedDimId: number | null;
  onSelectDim: (id: number | null) => void;
  onClose: () => void;
}) {
  const { yours, theirs, comparison } = data;
  const dimMap = useMemo(() => {
    const m: Record<number, { id: number; cat: string; name: string }> = {};
    for (const d of dims) m[d.id] = d;
    return m;
  }, [dims]);

  const selectedDim = selectedDimId != null ? dimMap[selectedDimId] : null;
  const selectedPerDim = selectedDimId != null ? comparison.perDim[selectedDimId] : null;

  // Build "theirs as scores" map for the strip — we want to render their
  // belief DNA, not yours, but tinted by agreement-bucket via colorOverride.
  return (
    <>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>
              You vs {theirs.shareableName || 'Anonymous DNA'}
            </h2>
            <FormatBadge format={theirs.format} />
          </div>
          {theirs.note && (
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '4px 0 0', fontStyle: 'italic' }}>
              "{theirs.note}"
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="Close comparison"
          style={{
            padding: '6px 10px', borderRadius: 6,
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.6)',
            fontSize: 14, cursor: 'pointer', lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <Stat
          label="Overall alignment"
          value={comparison.overallAlignment != null ? `${comparison.overallAlignment}%` : '—'}
          tone="primary"
        />
        <Stat label="Shared dimensions" value={`${comparison.totalShared}/124`} />
        <Stat label="Strong agreement" value={`${comparison.totalAgree}`} tone="good" />
        <Stat
          label="Top alignment"
          value={comparison.topAlignment ? prettyCat(comparison.topAlignment, comparison.perCat[comparison.topAlignment]?.label) : '—'}
        />
        <Stat
          label="Top divergence"
          value={comparison.topDivergence ? prettyCat(comparison.topDivergence, comparison.perCat[comparison.topDivergence]?.label) : '—'}
          tone="warn"
        />
      </div>

      {/* The strip — theirs colored by agreement */}
      <div style={{ marginBottom: 20 }}>
        <DnaStrip
          dimensions={dims}
          dimensionScores={theirs.dimensionScores}
          confidence={{}}
          totalResponses={0}
          dimensionsCovered={theirs.dimensionsCovered}
          overallConfidence={0}
          colorOverride={colorOverride}
          onCellSelect={(id) => onSelectDim(id === selectedDimId ? null : id)}
          selectedDimId={selectedDimId}
          agreementLegend
          miniMode={false}
        />
      </div>

      {/* Detail panel */}
      {selectedDim && selectedPerDim ? (
        <div style={{
          padding: 16, borderRadius: 10,
          background: 'rgba(0,0,0,0.3)',
          border: `1px solid ${BUCKET_COLOR[selectedPerDim.agreement]}55`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: 1 }}>
                Dimension #{selectedDim.id} · {selectedDim.cat}
              </span>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '2px 0 0' }}>
                {selectedDim.name}
              </h3>
            </div>
            <span style={{
              fontSize: 10, padding: '4px 10px', borderRadius: 4,
              background: `${BUCKET_COLOR[selectedPerDim.agreement]}22`,
              color: BUCKET_COLOR[selectedPerDim.agreement],
              textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700,
              border: `1px solid ${BUCKET_COLOR[selectedPerDim.agreement]}44`,
            }}>
              {BUCKET_LABEL[selectedPerDim.agreement]}
              {selectedPerDim.delta != null ? ` · Δ${selectedPerDim.delta}` : ''}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
            <SidePill label="You" value={selectedPerDim.yours} />
            <SidePill label={theirs.shareableName || 'Them'} value={selectedPerDim.theirs} />
          </div>

          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.5 }}>
            {BUCKET_COPY[selectedPerDim.agreement]}
          </p>
        </div>
      ) : (
        <div style={{
          padding: 14, borderRadius: 10, textAlign: 'center',
          background: 'rgba(0,0,0,0.2)',
          border: '1px dashed rgba(255,255,255,0.08)',
          fontSize: 12, color: 'rgba(255,255,255,0.4)',
        }}>
          Click any cell above to see both positions and the divergence detail.
        </div>
      )}

      {/* Hidden but useful — keep the yours summary visible so users can sanity-check */}
      <div style={{ marginTop: 14, fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: "'Space Mono', monospace", textAlign: 'right' }}>
        Your DNA: {yours.dimensionsCovered}/124 dims, {yours.totalResponses} responses, {yours.overallConfidence}% confidence
      </div>
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'primary' | 'good' | 'warn' }) {
  const color = tone === 'primary' ? '#a8c0ff' : tone === 'good' ? '#4ade80' : tone === 'warn' ? '#fb923c' : '#fff';
  return (
    <div style={{
      flex: '1 1 140px', minWidth: 140,
      padding: 12, borderRadius: 8,
      background: 'rgba(0,0,0,0.25)',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color }}>
        {value}
      </div>
    </div>
  );
}

function SidePill({ label, value }: { label: string; value: number | null }) {
  const color = value != null ? SHEX[value] : 'rgba(255,255,255,0.2)';
  return (
    <div style={{
      padding: 12, borderRadius: 8,
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          width: 10, height: 24, borderRadius: 2, background: color,
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
        }} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
            {value != null ? `${value}/9` : 'Unexplored'}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
            {value != null ? (BELIEF_LABELS_10[value] || 'Unknown') : '—'}
          </div>
        </div>
      </div>
    </div>
  );
}

function prettyCat(_key: string, label?: string): string {
  if (label) return label;
  return _key.charAt(0).toUpperCase() + _key.slice(1).replace(/_/g, ' ');
}
