// Belief Lineage drawer — opens when an explored DNA cell is clicked.
// Shows the provenance: which past responses moved this dimension's score,
// and by how much. "Recorded, not computed" — values come from a stored
// belief_lineage row written at the moment each response was ingested.
import { useState } from 'react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '../ui/sheet';
import { useLineage, type LineageRow } from '../../hooks/use-lineage';
import { BELIEF_LABELS_10, SHEX } from './genome-utils';

interface Props {
  dimensionId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// "No movement" threshold — deltas under this round to a neutral color so the
// list isn't a wall of saturated chips for trivial nudges.
const NEUTRAL_DELTA = 0.05;

function deltaColor(delta: number): string {
  if (delta > NEUTRAL_DELTA) return 'var(--color-belief-true)';
  if (delta < -NEUTRAL_DELTA) return 'var(--color-belief-false)';
  return 'var(--text-faint)';
}

function fmtDelta(d: number): string {
  if (Math.abs(d) < 0.005) return '±0.00';
  return `${d > 0 ? '+' : ''}${d.toFixed(2)}`;
}

function fmtScore(s: number | null): string {
  return s === null ? '—' : s.toFixed(1);
}

function ImpactRow({ row }: { row: LineageRow }) {
  const color = deltaColor(row.delta);
  // The user's raw answer, restated as a Likert-flavored short string.
  const rawAnswer = row.value > 0.5 ? 'Agreed' : row.value < 0.5 ? 'Disagreed' : 'Neutral';
  return (
    <div style={{
      padding: '12px 14px', borderRadius: 10,
      background: 'var(--surface-1)',
      border: '1px solid var(--border-subtle)',
      marginBottom: 10,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', gap: 12,
        marginBottom: 6, alignItems: 'baseline',
      }}>
        <div style={{
          fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4, flex: 1,
        }}>
          {row.probeText}
        </div>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 12, color, fontWeight: 600,
          whiteSpace: 'nowrap',
        }}>
          {fmtDelta(row.delta)}
        </div>
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: 11, color: 'var(--text-muted)',
        fontFamily: "'Space Mono', monospace",
      }}>
        <span>{rawAnswer}</span>
        <span>
          {fmtScore(row.scoreBefore)} → {fmtScore(row.scoreAfter)}
          <span style={{ marginLeft: 8, color: 'var(--text-faint)' }}>
            {new Date(row.createdAt).toLocaleDateString()}
          </span>
        </span>
      </div>
    </div>
  );
}

export default function LineageDrawer({ dimensionId, open, onOpenChange }: Props) {
  const [showAll, setShowAll] = useState(false);
  const q = useLineage(open ? dimensionId : null);

  const data = q.data;
  const list: LineageRow[] = data
    ? (showAll ? [...data.timeline].reverse() : data.top)
    : [];

  const currentScoreInt = data?.currentScore;
  const scoreFill = currentScoreInt !== null && currentScoreInt !== undefined
    ? SHEX[currentScoreInt]
    : 'var(--surface-3)';
  const scoreLabel = currentScoreInt !== null && currentScoreInt !== undefined
    ? BELIEF_LABELS_10[currentScoreInt] || ''
    : 'Unexplored';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" style={{
        width: '100%', maxWidth: 480,
        background: 'hsl(var(--background))',
        borderLeft: '1px solid var(--border-subtle)',
        color: 'var(--text-primary)',
        overflowY: 'auto',
      }}>
        <SheetHeader>
          <SheetTitle style={{
            color: 'var(--text-primary)', fontSize: 16, fontWeight: 700,
          }}>
            Belief Lineage
          </SheetTitle>
          <SheetDescription style={{ color: 'var(--text-muted)', fontSize: 12 }}>
            Which of your past responses shaped this score.
          </SheetDescription>
        </SheetHeader>

        {q.isLoading && (
          <div style={{ padding: 24, color: 'var(--text-muted)', fontSize: 13 }}>
            Loading lineage…
          </div>
        )}

        {q.isError && (
          <div style={{ padding: 24, color: 'var(--text-muted)', fontSize: 13 }}>
            Couldn't load lineage.
          </div>
        )}

        {data && (
          <>
            {/* Header card — dimension + current score */}
            <div style={{
              marginTop: 16, padding: 16, borderRadius: 12,
              background: 'var(--surface-2)',
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{
                fontSize: 11, fontFamily: "'Space Mono', monospace",
                color: 'var(--text-muted)', textTransform: 'uppercase',
                letterSpacing: 1.2, marginBottom: 4,
              }}>
                {data.dimension?.catLabel ?? 'Dimension'}
              </div>
              <div style={{
                fontSize: 18, fontWeight: 700, color: 'var(--text-primary)',
                marginBottom: 8,
              }}>
                {data.dimension?.name ?? `Dimension ${data.dimensionId}`}
              </div>
              {data.dimension?.desc && (
                <div style={{
                  fontSize: 12, color: 'var(--text-secondary)',
                  lineHeight: 1.5, marginBottom: 12,
                }}>
                  {data.dimension.desc}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 6,
                  background: scoreFill,
                  border: '1px solid var(--border-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Space Mono', monospace", fontSize: 16,
                  fontWeight: 700, color: 'var(--text-primary)',
                }}>
                  {currentScoreInt ?? '·'}
                </div>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>
                    {scoreLabel}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {data.currentConfidence}% confidence · {data.totalContributors} contributing response{data.totalContributors === 1 ? '' : 's'}
                  </div>
                </div>
              </div>
            </div>

            {/* List header + toggle */}
            <div style={{
              marginTop: 20, marginBottom: 10,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{
                fontSize: 11, fontFamily: "'Space Mono', monospace",
                color: 'var(--text-muted)', textTransform: 'uppercase',
                letterSpacing: 1.5,
              }}>
                {showAll ? 'Full Timeline' : 'Top Contributors'}
              </div>
              {data.totalContributors > data.top.length && (
                <button
                  onClick={() => setShowAll(s => !s)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-soft)',
                    color: 'var(--accent-text)',
                    padding: '4px 10px', borderRadius: 6,
                    fontSize: 11, cursor: 'pointer',
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  {showAll ? 'Top 10' : `All ${data.totalContributors}`}
                </button>
              )}
            </div>

            {data.totalContributors === 0 && (
              <div style={{
                padding: 24, textAlign: 'center',
                color: 'var(--text-muted)', fontSize: 13,
              }}>
                No lineage yet. Answer probes that touch this dimension to see them appear here.
              </div>
            )}

            {list.map(row => <ImpactRow key={row.id} row={row} />)}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
