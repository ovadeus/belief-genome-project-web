// Loading-state skeleton matching the real DnaStrip row structure.
// Used during compare query in flight so the grid doesn't reflow on data
// arrival. Kept intentionally close to DnaStrip's layout — same row gaps,
// same label column width, same trailing count column.

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

export default function DnaStripSkeleton({ message }: { message?: string }) {
  return (
    <div aria-busy="true" aria-label={message || 'Loading comparison'}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: 1.5 }}>
          {message || 'Loading…'}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {CATEGORIES.map((cat) => (
          <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 100, minWidth: 100,
              fontFamily: "'Space Mono', monospace", fontSize: 10,
              color: 'rgba(255,255,255,0.2)', textAlign: 'right',
              textTransform: 'uppercase', letterSpacing: 0.5,
            }}>
              {cat.label}
            </span>
            <div style={{ display: 'flex', gap: 2, flex: 1, minWidth: 0, height: 14 }}>
              {Array.from({ length: cat.count }).map((_, i) => (
                <div
                  key={i}
                  className="dna-strip-skel-cell"
                  style={{
                    flex: 1, minWidth: 0, height: 14, borderRadius: 2,
                    background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.05), rgba(255,255,255,0.05) 2px, transparent 2px, transparent 4px)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    animation: `dnaSkelPulse 1.4s ease-in-out ${i * 0.02}s infinite`,
                  }}
                />
              ))}
            </div>
            <span style={{ width: 32, minWidth: 32, fontFamily: "'Space Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.15)' }}>
              —/{cat.count}
            </span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes dnaSkelPulse {
          0%, 100% { opacity: 0.4; }
          50%      { opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
