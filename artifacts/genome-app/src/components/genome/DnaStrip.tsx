import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { SHEX, BELIEF_LABELS_10 } from './genome-utils';
import { useExplore } from './ExploreContext';
import DnaCell from './DnaCell';
import { useHarmonize } from '../../hooks/use-harmonize';
import type { HarmonizerCell } from '../../lib/harmonize/types';
import { BGP_HARMONIZE_TOGGLE_EVENT } from '../../hooks/use-bgp-easter-egg';

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
  /**
   * Fires when an EXPLORED cell is clicked — used to open the lineage drawer
   * for that dimension. Unexplored cells continue to launch the explore flow.
   * Ignored when compare-mode `onCellSelect` is set.
   */
  onExploredClick?: (dimId: number) => void;
  /** When set, only the row for this category key is rendered (used as a mini-strip on the probe page). */
  filterCat?: string;
  /** Compact mode: hides header, legend, totals — useful inside the probe page. */
  miniMode?: boolean;
  /**
   * Compare mode: per-dimension fill color override (typically agreement-bucket
   * colors). When provided, the legend at the bottom switches to the agreement
   * legend instead of the belief legend.
   */
  colorOverride?: Record<number, string>;
  /**
   * Compare mode: when supplied, every cell becomes clickable and this
   * callback fires with the dim id (compare page uses it to drive the
   * detail panel). When omitted, default behaviour is preserved (only
   * unexplored cells launch the explore flow).
   */
  onCellSelect?: (dimId: number) => void;
  /** Currently selected dim id in compare mode — gets a focus ring. */
  selectedDimId?: number | null;
  /** When true, render the agreement legend instead of belief legend. */
  agreementLegend?: boolean;
}

interface TooltipState {
  x: number; y: number; name: string; score: number | null; conf: number;
}

export default function DnaStrip({
  dimensions, dimensionScores, confidence,
  totalResponses, dimensionsCovered, overallConfidence,
  filterCat, miniMode = false, onExploredClick,
  colorOverride, onCellSelect, selectedDimId, agreementLegend = false,
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
    // Compare mode short-circuit — any cell click goes to the supplied handler.
    if (onCellSelect) {
      onCellSelect(dim.id);
      return;
    }
    // Explored cell → open lineage drawer (when parent provides handler).
    if (dimensionScores[dim.id] !== undefined) {
      onExploredClick?.(dim.id);
      return;
    }
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
  }, [dimensions, dimensionScores, startExplore, navigate, onCellSelect, onExploredClick]);

  const visibleCats = filterCat ? CATEGORIES.filter(c => c.id === filterCat) : CATEGORIES;

  // Harmonize DNA — only on the main belief-legend view (not compare/agreement,
  // not mini-strips inside the probe page). Build the cell sequence in the
  // exact left-to-right, row-by-row order DnaStrip renders so the audio cursor
  // matches what the user sees.
  const showHarmonize = !miniMode && !agreementLegend && !onCellSelect;
  const harmonizerCells = useMemo<HarmonizerCell[]>(() => {
    if (!showHarmonize) return [];
    const out: HarmonizerCell[] = [];
    for (const cat of visibleCats) {
      const catDims = dimensions
        .filter(d => d.cat === cat.id)
        .sort((a, b) => a.id - b.id);
      for (const d of catDims) {
        out.push({
          dimId: d.id,
          catKey: d.cat,
          score: dimensionScores[d.id],
          conf: confidence[d.id] ?? 0,
        });
      }
    }
    return out;
  }, [showHarmonize, visibleCats, dimensions, dimensionScores, confidence]);

  const handleCellFlash = useCallback((dimId: number) => {
    const root = containerRef.current;
    if (!root) return;
    const el = root.querySelector(`[data-dim-id="${dimId}"]`);
    if (!el) return;
    el.classList.add('harmonize-flash');
    window.setTimeout(() => el.classList.remove('harmonize-flash'), 220);
  }, []);

  const harmonize = useHarmonize(harmonizerCells, handleCellFlash);

  // Hidden Easter-egg trigger: typing B-G-P on the dashboard toggles harmonize
  // playback. The detector lives in DashboardPage and dispatches a window
  // event; only DnaStrip instances that actually have harmonize wired
  // (showHarmonize === true) respond.
  useEffect(() => {
    if (!showHarmonize) return;
    const onToggle = (): void => {
      if (harmonize.state === 'playing') harmonize.stop();
      else void harmonize.play();
    };
    window.addEventListener(BGP_HARMONIZE_TOGGLE_EVENT, onToggle);
    return () => {
      window.removeEventListener(BGP_HARMONIZE_TOGGLE_EVENT, onToggle);
    };
  }, [showHarmonize, harmonize]);

  // No fallback synthetic dims — show a skeleton if dimensions haven't loaded.
  if (dimensions.length === 0) {
    return (
      <div style={{ padding: 24, color: 'var(--text-muted)', fontSize: 12, textAlign: 'center' }}>
        Loading dimensions…
      </div>
    );
  }

  return (
    <div ref={containerRef} data-theme="dark" className="viz-dark-island">
      {!miniMode && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
        }}>
          <span style={{
            fontSize: 11, fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
            letterSpacing: 1.5, color: 'var(--text-muted)',
          }}>
            Belief Genome — Belief DNA
          </span>
          <div style={{ display: 'flex', gap: 16, fontSize: 11, fontFamily: "'Space Mono', monospace", color: 'var(--text-faint)' }}>
            <span data-testid="dna-total-responses">{totalResponses} responses</span>
            <span data-testid="dna-dims-covered">{dimensionsCovered}/124 dims</span>
            <span data-testid="dna-confidence">{overallConfidence}% confidence</span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: miniMode ? 4 : 8 }}>
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
                color: 'var(--text-muted)', textAlign: 'right',
                textTransform: 'uppercase', letterSpacing: 0.5,
              }}>
                {cat.label}
              </span>
              <div className="dna-strip-cells-scroll" style={{ display: 'flex', gap: 2, flex: 1, minWidth: 0, height: miniMode ? 18 : 22 }}>
                {catDims.map(dim => {
                  const raw = dimensionScores[dim.id];
                  const score = raw === undefined ? null : raw;
                  const isSelected = selectedDimId === dim.id;
                  return (
                    <div key={dim.id} style={{
                      flex: 1, minWidth: 0, display: 'flex',
                      outline: isSelected ? '2px solid var(--accent-bright)' : 'none',
                      outlineOffset: 1, borderRadius: 2,
                    }}>
                      <DnaCell
                        dimId={dim.id}
                        dimName={dim.name}
                        catKey={dim.cat}
                        catLabel={cat.label}
                        score={score}
                        confidence={confidence[dim.id] ?? 0}
                        height={miniMode ? 18 : 22}
                        onClick={() => handleCellClick(dim)}
                        onHover={handleHover}
                        onLeave={handleLeave}
                        colorOverride={colorOverride?.[dim.id]}
                        forceClickable={!!onCellSelect}
                      />
                    </div>
                  );
                })}
              </div>
              <span style={{
                width: 32, minWidth: 32, fontFamily: "'Space Mono', monospace", fontSize: 9,
                color: 'var(--text-faint)',
              }}>
                {explored}/{catDims.length}
              </span>
            </div>
          );
        })}
      </div>

      {!miniMode && agreementLegend && (
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16,
          fontSize: 10, color: 'var(--text-muted)', flexWrap: 'wrap',
        }}>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#22c55e', marginRight: 4, verticalAlign: 'middle' }} />Strong Agreement (Δ≤1)</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#facc15', marginRight: 4, verticalAlign: 'middle' }} />Mild (Δ≤3)</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#fb923c', marginRight: 4, verticalAlign: 'middle' }} />Moderate (Δ≤5)</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#dc2626', marginRight: 4, verticalAlign: 'middle' }} />Strong Divergence</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'var(--border-strong)', marginRight: 4, verticalAlign: 'middle' }} />One side unexplored</span>
        </div>
      )}
      {!miniMode && !agreementLegend && (
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16,
          fontSize: 10, color: 'var(--text-muted)', flexWrap: 'wrap',
        }}>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#dc2626', marginRight: 4, verticalAlign: 'middle' }} />Absolute False</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#f87171', marginRight: 4, verticalAlign: 'middle' }} />False</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#22c55e', marginRight: 4, verticalAlign: 'middle' }} />Balanced</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#60a5fa', marginRight: 4, verticalAlign: 'middle' }} />True</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#2563eb', marginRight: 4, verticalAlign: 'middle' }} />Absolute True</span>
          <span><span style={{
            display: 'inline-block', width: 10, height: 10, borderRadius: 2, marginRight: 4, verticalAlign: 'middle',
            background: 'repeating-linear-gradient(45deg, var(--border-subtle), var(--border-subtle) 2px, transparent 2px, transparent 4px)',
            border: '1px solid var(--border-soft)',
          }} />Unexplored</span>
        </div>
      )}

      {tooltip && (
        <div style={{
          position: 'fixed', left: tooltip.x, top: tooltip.y,
          transform: 'translateX(-50%) translateY(-100%)',
          background: 'var(--panel-glass-bg)', border: '1px solid var(--border-soft)',
          borderRadius: 6, padding: '6px 10px', fontFamily: "'Space Mono', monospace",
          fontSize: 10, color: 'var(--text-primary)', whiteSpace: 'nowrap', zIndex: 9999,
          pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        }}>
          <div style={{ marginBottom: 2 }}>{tooltip.name}{tooltip.score === null ? ': Unexplored' : ''}</div>
          {tooltip.score !== null && (
            <div style={{ color: SHEX[tooltip.score] }}>
              {BELIEF_LABELS_10[tooltip.score] || 'Unknown'} ({tooltip.score}/9{tooltip.conf > 0 ? `, ${tooltip.conf}% conf` : ''})
            </div>
          )}
          {tooltip.score === null && (
            <div style={{ borderTop: '1px dashed var(--border-soft)', paddingTop: 3, marginTop: 3, color: 'var(--accent-bright)', fontSize: 9 }}>
              → Click to Explore Now
            </div>
          )}
        </div>
      )}
    </div>
  );
}
