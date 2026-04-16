import { useState, useRef, useCallback } from 'react';
import { SHEX, BELIEF_LABELS_10 } from './genome-utils';

const CATEGORIES = [
  { id: 'epistemology',  label: 'Epistemology',   count: 10 },
  { id: 'spirituality',  label: 'Spirituality',   count: 15 },
  { id: 'morality',      label: 'Morality',       count: 15 },
  { id: 'politics',      label: 'Politics',       count: 20 },
  { id: 'social',        label: 'Social',         count: 15 },
  { id: 'economics',     label: 'Economics',       count: 10 },
  { id: 'science_tech',  label: 'Sci & Tech',     count: 10 },
  { id: 'education',     label: 'Education',       count: 5 },
  { id: 'health',        label: 'Health',           count: 5 },
  { id: 'psychology',    label: 'Psychology',       count: 10 },
  { id: 'relationships', label: 'Relationships',    count: 9 },
];

interface DimDef { id: number; name: string; cat: string; }

interface Props {
  dimensions: DimDef[];
  dimensionScores: Record<number, number>;
  confidence: Record<number, number>;
  totalResponses: number;
  dimensionsCovered: number;
  overallConfidence: number;
}

export default function DnaStrip({ dimensions, dimensionScores, confidence, totalResponses, dimensionsCovered, overallConfidence }: Props) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; score: number | null; label: string; conf: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCellEnter = useCallback((e: React.MouseEvent, dim: DimDef, score: number | null) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    let x = rect.left + rect.width / 2;
    let y = rect.top - 8;
    if (x > window.innerWidth - 200) x = window.innerWidth - 200;
    if (x < 10) x = 10;
    if (y < 40) y = rect.bottom + 8;
    const label = score !== null ? BELIEF_LABELS_10[score] || 'Unknown' : 'Unexplored';
    const conf = confidence[dim.id] ?? 0;
    setTooltip({ x, y, name: dim.name, score, label, conf });
  }, [confidence]);

  const handleCellLeave = useCallback(() => setTooltip(null), []);

  let dimOffset = 0;

  return (
    <div ref={containerRef}>
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
          <span>{totalResponses} responses</span>
          <span>{dimensionsCovered}/124 dims</span>
          <span>{overallConfidence}% confidence</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {CATEGORIES.map(cat => {
          const startOffset = dimOffset;
          dimOffset += cat.count;
          const catDims = dimensions.filter(d => d.cat === cat.id);
          if (catDims.length === 0) {
            const fakeDims = Array.from({ length: cat.count }, (_, i) => ({
              id: startOffset + i + 4,
              name: `Dimension ${startOffset + i + 1}`,
              cat: cat.id,
            }));
            const explored = fakeDims.filter(d => dimensionScores[d.id] !== undefined).length;
            return (
              <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 100, minWidth: 100, fontFamily: "'Space Mono', monospace", fontSize: 10,
                  color: 'rgba(255,255,255,0.35)', textAlign: 'right', textTransform: 'uppercase', letterSpacing: 0.5,
                }}>
                  {cat.label}
                </span>
                <div style={{ display: 'flex', gap: 2, flex: 1, height: 14 }}>
                  {fakeDims.map(dim => {
                    const score = dimensionScores[dim.id];
                    const isExplored = score !== undefined;
                    return (
                      <div
                        key={dim.id}
                        onMouseEnter={e => handleCellEnter(e, dim, isExplored ? score : null)}
                        onMouseLeave={handleCellLeave}
                        style={{
                          flex: 1, minWidth: 0, height: 14, borderRadius: 2, cursor: 'pointer',
                          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                          ...(isExplored
                            ? { background: SHEX[score], boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }
                            : {
                                background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.04), rgba(255,255,255,0.04) 2px, transparent 2px, transparent 4px)',
                                border: '1px solid rgba(255,255,255,0.06)',
                              }),
                        }}
                        onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = 'scaleY(1.4)'; (e.currentTarget as HTMLElement).style.zIndex = '2'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 8px rgba(255,255,255,0.25)'; }}
                        onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = 'scaleY(1)'; (e.currentTarget as HTMLElement).style.zIndex = '0'; (e.currentTarget as HTMLElement).style.boxShadow = isExplored ? 'inset 0 0 0 1px rgba(255,255,255,0.08)' : 'none'; }}
                      />
                    );
                  })}
                </div>
                <span style={{
                  width: 28, minWidth: 28, fontFamily: "'Space Mono', monospace", fontSize: 9,
                  color: 'rgba(255,255,255,0.25)',
                }}>
                  {explored}/{cat.count}
                </span>
              </div>
            );
          }

          const explored = catDims.filter(d => dimensionScores[d.id] !== undefined).length;
          return (
            <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 100, minWidth: 100, fontFamily: "'Space Mono', monospace", fontSize: 10,
                color: 'rgba(255,255,255,0.35)', textAlign: 'right', textTransform: 'uppercase', letterSpacing: 0.5,
              }}>
                {cat.label}
              </span>
              <div style={{ display: 'flex', gap: 2, flex: 1, height: 14 }}>
                {catDims.map(dim => {
                  const score = dimensionScores[dim.id];
                  const isExplored = score !== undefined;
                  return (
                    <div
                      key={dim.id}
                      onMouseEnter={e => handleCellEnter(e, dim, isExplored ? score : null)}
                      onMouseLeave={handleCellLeave}
                      style={{
                        flex: 1, minWidth: 0, height: 14, borderRadius: 2, cursor: 'pointer',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        ...(isExplored
                          ? { background: SHEX[score], boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }
                          : {
                              background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.04), rgba(255,255,255,0.04) 2px, transparent 2px, transparent 4px)',
                              border: '1px solid rgba(255,255,255,0.06)',
                            }),
                      }}
                      onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = 'scaleY(1.4)'; (e.currentTarget as HTMLElement).style.zIndex = '2'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 8px rgba(255,255,255,0.25)'; }}
                      onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = 'scaleY(1)'; (e.currentTarget as HTMLElement).style.zIndex = '0'; (e.currentTarget as HTMLElement).style.boxShadow = isExplored ? 'inset 0 0 0 1px rgba(255,255,255,0.08)' : 'none'; }}
                    />
                  );
                })}
              </div>
              <span style={{
                width: 28, minWidth: 28, fontFamily: "'Space Mono', monospace", fontSize: 9,
                color: 'rgba(255,255,255,0.25)',
              }}>
                {explored}/{catDims.length}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{
        display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16,
        fontSize: 10, color: 'rgba(255,255,255,0.4)', flexWrap: 'wrap',
      }}>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#dc2626', marginRight: 4, verticalAlign: 'middle' }} />Absolute False</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#f87171', marginRight: 4, verticalAlign: 'middle' }} />False</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#22c55e', marginRight: 4, verticalAlign: 'middle' }} />Uncertain</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#60a5fa', marginRight: 4, verticalAlign: 'middle' }} />True</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#2563eb', marginRight: 4, verticalAlign: 'middle' }} />Absolute True</span>
        <span><span style={{
          display: 'inline-block', width: 10, height: 10, borderRadius: 2, marginRight: 4, verticalAlign: 'middle',
          background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.06), rgba(255,255,255,0.06) 2px, transparent 2px, transparent 4px)',
          border: '1px solid rgba(255,255,255,0.1)',
        }} />Unexplored</span>
      </div>

      {tooltip && (
        <div style={{
          position: 'fixed', left: tooltip.x, top: tooltip.y,
          transform: 'translateX(-50%) translateY(-100%)',
          background: 'rgba(15,15,26,0.95)', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 6, padding: '6px 10px', fontFamily: "'Space Mono', monospace",
          fontSize: 10, color: '#fff', whiteSpace: 'nowrap', zIndex: 9999,
          pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        }}>
          <div style={{ marginBottom: 2 }}>{tooltip.name}</div>
          <div style={{ color: tooltip.score !== null ? SHEX[tooltip.score] : 'rgba(255,255,255,0.3)' }}>
            {tooltip.label}{tooltip.score !== null ? ` (${tooltip.score}/9)` : ''}
          </div>
          {tooltip.conf > 0 && (
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9 }}>
              Confidence: {tooltip.conf}%
            </div>
          )}
        </div>
      )}
    </div>
  );
}
