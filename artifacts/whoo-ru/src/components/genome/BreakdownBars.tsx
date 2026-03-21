// Category Breakdown — Spectrum bars with dot slider, axis labels, domain labels
// Matches desktop exactly: same categories, same axes, same colors, same labels

const CAT_ORDER = ['philosophy', 'religion', 'psychology', 'relationships', 'society', 'economics', 'science_tech', 'politics', 'life'];
const CAT_SHORT: Record<string, string> = {
  philosophy: 'Philosophy', religion: 'Religion', psychology: 'Psychology',
  relationships: 'Relationships', society: 'Society', economics: 'Economics',
  science_tech: 'Sci & Tech', politics: 'Politics', life: 'Life',
};

const DOMAIN_AXES: Record<string, { left: string; right: string; mid: string }> = {
  philosophy:    { left: 'Relativist',   right: 'Absolutist',      mid: 'Mixed epistemic'  },
  religion:      { left: 'Secular',      right: 'Spiritual',       mid: 'Open spiritual'   },
  psychology:    { left: 'Determinist',  right: 'Autonomous',      mid: 'Compatibilist'    },
  relationships: { left: 'Fluid',        right: 'Traditional',     mid: 'Contextual'       },
  society:       { left: 'Collectivist', right: 'Individualist',   mid: 'Balanced social'  },
  economics:     { left: 'Progressive',  right: 'Market-oriented', mid: 'Mixed economic'   },
  science_tech:  { left: 'Tech-skeptic', right: 'Techno-optimist', mid: 'Tech-pragmatist'  },
  politics:      { left: 'Progressive',  right: 'Conservative',    mid: 'Centrist'         },
  life:          { left: 'Structured',   right: 'Spontaneous',     mid: 'Balanced'         },
};

function domainLabel(cat: string, avg: number): string {
  const axis = DOMAIN_AXES[cat];
  if (!axis || avg == null) return '—';
  if (avg <= 0.22) return `Strongly ${axis.left}`;
  if (avg <= 0.40) return axis.left;
  if (avg <= 0.60) return axis.mid;
  if (avg <= 0.78) return axis.right;
  return `Strongly ${axis.right}`;
}

function catColour(v: number | null): string {
  if (v == null) return '#787891';
  if (v <= 0.22) return '#dc3232';
  if (v <= 0.40) return '#ff7728';
  if (v <= 0.60) return '#787891';
  if (v <= 0.78) return '#3cb4b4';
  return '#50b4ff';
}

interface HistoryEntry {
  probeCategory: string;
  value: number;
}

interface Props {
  history: HistoryEntry[];
}

export default function BreakdownBars({ history }: Props) {
  // Compute category averages from history (value 0-1)
  const buckets: Record<string, number[]> = {};
  for (const h of history) {
    const cat = h.probeCategory || 'life';
    if (!buckets[cat]) buckets[cat] = [];
    buckets[cat].push(h.value);
  }
  const avgs: Record<string, number> = {};
  const counts: Record<string, number> = {};
  for (const [cat, vals] of Object.entries(buckets)) {
    avgs[cat] = vals.reduce((s, v) => s + v, 0) / vals.length;
    counts[cat] = vals.length;
  }

  if (history.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: 40 }}>
        No responses yet — answer some probes first.
      </div>
    );
  }

  return (
    <div>
      <div style={{
        fontSize: 11, fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
        letterSpacing: 1.5, color: 'rgba(255,255,255,0.5)', marginBottom: 16,
      }}>
        Category Breakdown
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {CAT_ORDER.map(cat => {
          const avg = avgs[cat];
          const cnt = counts[cat] || 0;
          const name = CAT_SHORT[cat] || cat;
          const axis = DOMAIN_AXES[cat] || { left: '', right: '', mid: '' };
          const hasData = avg !== undefined && cnt > 0;
          const pct = hasData ? Math.round(avg * 100) : 50;
          const col = catColour(hasData ? avg : null);
          const lbl = hasData ? domainLabel(cat, avg) : '';

          return (
            <div key={cat} style={{ opacity: hasData ? 1 : 0.32 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr auto', gap: 8, alignItems: 'center' }}>
                {/* Category name */}
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'right' }}>{name}</span>

                {/* Track */}
                <div style={{ position: 'relative', height: 14 }}>
                  {/* Background gradient */}
                  <div style={{
                    position: 'absolute', inset: '3px 0', borderRadius: 4,
                    background: 'linear-gradient(90deg, #dc3232, #ff7728 25%, #787891 50%, #3cb4b4 75%, #50b4ff)',
                    opacity: 0.35,
                  }} />
                  {/* Center line */}
                  <div style={{
                    position: 'absolute', left: '50%', top: 0, width: 1, height: '100%',
                    background: 'rgba(255,255,255,0.28)', zIndex: 3,
                  }} />
                  {/* Dot */}
                  {hasData && (
                    <div style={{
                      position: 'absolute', left: `${pct}%`, top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 15, height: 15, borderRadius: '50%',
                      background: col, border: '2.5px solid rgba(255,255,255,0.92)',
                      boxShadow: `0 0 8px ${col}, 0 0 2px rgba(0,0,0,0.8)`,
                      zIndex: 4,
                    }} title={lbl} />
                  )}
                </div>

                {/* Count */}
                <span style={{
                  fontSize: 11, fontFamily: "'Space Mono', monospace",
                  color: 'rgba(255,255,255,0.35)', minWidth: 30, textAlign: 'right',
                }}>
                  {hasData ? `${cnt}\u00d7` : ''}
                </span>
              </div>

              {/* Axis labels + domain label */}
              {hasData && (
                <div style={{
                  display: 'grid', gridTemplateColumns: '110px 1fr auto', gap: 8, marginTop: 2,
                }}>
                  <span />
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{axis.left}</span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{axis.right}</span>
                  </div>
                  <span style={{ fontSize: 11, color: col, minWidth: 120, textAlign: 'right' }}>{lbl}</span>
                </div>
              )}
              {!hasData && (
                <div style={{
                  display: 'grid', gridTemplateColumns: '110px 1fr auto', gap: 8, marginTop: 2,
                }}>
                  <span />
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{axis.left}</span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{axis.right}</span>
                  </div>
                  <span style={{
                    fontSize: 10, color: 'rgba(255,255,255,0.25)', minWidth: 120, textAlign: 'right',
                  }}>unexplored</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
