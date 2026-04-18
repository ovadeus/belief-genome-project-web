import { useState, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { SHEX, BELIEF_LABELS_10 } from './genome-utils';
import { useExplore } from './ExploreContext';
import DnaCell from './DnaCell';

const CATEGORIES = [
  { id: 'epistemology',  label: 'Epistemology',   count: 10 },
  { id: 'spirituality',  label: 'Spirituality',   count: 15 },
  { id: 'morality',      label: 'Morality',       count: 15 },
  { id: 'politics',      label: 'Politics',       count: 20 },
  { id: 'social',        label: 'Social',         count: 15 },
  { id: 'economics',     label: 'Economics',      count: 10 },
  { id: 'science_tech',  label: 'Sci & Tech',     count: 10 },
  { id: 'education',     label: 'Education',       count: 5 },
  { id: 'health',        label: 'Health',           count: 5 },
  { id: 'psychology',    label: 'Psychology',     count: 10 },
  { id: 'relationships', label: 'Relationships',   count: 9 },
];

interface DimDef { id: number; name: string; cat: string; }

interface Props {
  dimensions: DimDef[];
  dimensionScores: Record<number, number>;
  confidence: Record<number, number>;
  totalResponses: number;
  dimensionsCovered: number;
  overallConfidence: number;
  /** When set, only the row for this category key is rendered (used as a mini-strip on the probe page). */
  filterCat?: string;
  /** Compact mode: hides header, legend, totals — useful inside the probe page. */
  miniMode?: boolean;
}

interface TooltipState {
  x: number; y: number; name: string; score: number | null; conf: number;
}

export default function DnaStrip({
  dimensions, dimensionScores, confidence,
  totalResponses, dimensionsCovered, overallConfidence,
  filterCat, miniMode = false,
}: Props) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { startExplore } = useExplore();
  const [, navigate] = useLocation();

  const handleHover = useCallback((e: React.MouseEvent, name: string, score: number | null, conf: number) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    let x = rect.left + rect.width / 2;
    let y = rect.top - 8;
    if (x > window.innerWidth - 200) x = window.innerWidth - 200;
    if (x < 10) x = 10;
    if (y < 40) y = rect.bottom + 8;
    setTooltip({ x, y, name, score, conf });
  }, []);

  const handleLeave = useCallback(() => setTooltip(null), []);

  const handleCellClick = useCallback((dim: DimDef) => {
    if (dimensionScores[dim.id] !== undefined) return;
    const cat = CATEGORIES.find(c => c.id === dim.cat);
    if (!cat) return;
    const allDimsInCat = dimensions.filter(d => d.cat === dim.cat);
    const unexploredInCat = allDimsInCat.filter(d => dimensionScores[d.id] === undefined);
    const clickedFirst = [dim.id, ...unexploredInCat.filter(d => d.id !== dim.id).map(d => d.id)];
    const dimNames: Record<number, string> = {};
    unexploredInCat.forEach(d => { dimNames[d.id] = d.name; });
    dimNames[dim.id] = dim.name;
    startExplore({ catKey: cat.id, catLabel: cat.label, dimQueue: clickedFirst, dimNames });
    navigate('/probe');
  }, [dimensions, dimensionScores, startExplore, navigate]);

  const visibleCats = filterCat ? CATEGORIES.filter(c => c.id === filterCat) : CATEGORIES;

  // No fallback synthetic dims — show a skeleton if dimensions haven't loaded.
  if (dimensions.length === 0) {
    return (
      <div style={{ padding: 24, color: 'rgba(255,255,255,0.4)', fontSize: 12, textAlign: 'center' }}>
        Loading dimensions…
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      {!miniMode && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
        }}>
          <span style={{
            fontSize: 11, fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
            letterSpacing: 1.5, color: 'rgba(255,255,255,0.5)',
          }}>
            Belief Genome — Belief DNA
          </span>
          <div style={{ display: 'flex', gap: 16, fontSize: 11, fontFamily: "'Space Mono', monospace", color: 'rgba(255,255,255,0.35)' }}>
            <span data-testid="dna-total-responses">{totalResponses} responses</span>
            <span data-testid="dna-dims-covered">{dimensionsCovered}/124 dims</span>
            <span data-testid="dna-confidence">{overallConfidence}% confidence</span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: miniMode ? 4 : 6 }}>
        {visibleCats.map(cat => {
          const catDims = dimensions
            .filter(d => d.cat === cat.id)
            .sort((a, b) => a.id - b.id);
          if (catDims.length === 0) return null;
          const explored = catDims.filter(d => dimensionScores[d.id] !== undefined).length;
          return (
            <div key={cat.id} className="dna-strip-row" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: miniMode ? 80 : 100, minWidth: miniMode ? 80 : 100,
                fontFamily: "'Space Mono', monospace", fontSize: miniMode ? 9 : 10,
                color: 'rgba(255,255,255,0.45)', textAlign: 'right',
                textTransform: 'uppercase', letterSpacing: 0.5,
              }}>
                {cat.label}
              </span>
              <div className="dna-strip-cells-scroll" style={{ display: 'flex', gap: 2, flex: 1, minWidth: 0, height: miniMode ? 12 : 14 }}>
                {catDims.map(dim => {
                  const raw = dimensionScores[dim.id];
                  const score = raw === undefined ? null : raw;
                  return (
                    <DnaCell
                      key={dim.id}
                      dimId={dim.id}
                      dimName={dim.name}
                      catKey={dim.cat}
                      catLabel={cat.label}
                      score={score}
                      confidence={confidence[dim.id] ?? 0}
                      height={miniMode ? 12 : 14}
                      onClick={() => handleCellClick(dim)}
                      onHover={handleHover}
                      onLeave={handleLeave}
                    />
                  );
                })}
              </div>
              <span style={{
                width: 32, minWidth: 32, fontFamily: "'Space Mono', monospace", fontSize: 9,
                color: 'rgba(255,255,255,0.35)',
              }}>
                {explored}/{catDims.length}
              </span>
            </div>
          );
        })}
      </div>

      {!miniMode && (
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16,
          fontSize: 10, color: 'rgba(255,255,255,0.4)', flexWrap: 'wrap',
        }}>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#dc2626', marginRight: 4, verticalAlign: 'middle' }} />Absolute False</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#f87171', marginRight: 4, verticalAlign: 'middle' }} />False</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#22c55e', marginRight: 4, verticalAlign: 'middle' }} />Balanced</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#60a5fa', marginRight: 4, verticalAlign: 'middle' }} />True</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#2563eb', marginRight: 4, verticalAlign: 'middle' }} />Absolute True</span>
          <span><span style={{
            display: 'inline-block', width: 10, height: 10, borderRadius: 2, marginRight: 4, verticalAlign: 'middle',
            background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.06), rgba(255,255,255,0.06) 2px, transparent 2px, transparent 4px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }} />Unexplored</span>
        </div>
      )}

      {tooltip && (
        <div style={{
          position: 'fixed', left: tooltip.x, top: tooltip.y,
          transform: 'translateX(-50%) translateY(-100%)',
          background: 'rgba(15,15,26,0.95)', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 6, padding: '6px 10px', fontFamily: "'Space Mono', monospace",
          fontSize: 10, color: '#fff', whiteSpace: 'nowrap', zIndex: 9999,
          pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        }}>
          <div style={{ marginBottom: 2 }}>{tooltip.name}{tooltip.score === null ? ': Unexplored' : ''}</div>
          {tooltip.score !== null && (
            <div style={{ color: SHEX[tooltip.score] }}>
              {BELIEF_LABELS_10[tooltip.score] || 'Unknown'} ({tooltip.score}/9{tooltip.conf > 0 ? `, ${tooltip.conf}% conf` : ''})
            </div>
          )}
          {tooltip.score === null && (
            <div style={{ borderTop: '1px dashed rgba(255,255,255,0.15)', paddingTop: 3, marginTop: 3, color: '#6c8fff', fontSize: 9 }}>
              → Click to Explore Now
            </div>
          )}
        </div>
      )}
    </div>
  );
}
