const BANDS = [
  { range: '0–11',  label: 'Absolute False', color: '#dc2626', desc: 'Deep red' },
  { range: '12–22', label: 'Deeply False',   color: '#ef4444', desc: 'Red' },
  { range: '23–33', label: 'False',          color: '#f87171', desc: 'Light red' },
  { range: '34–44', label: 'Leaning False',  color: '#fca5a5', desc: 'Pale red' },
  { range: '45–55', label: 'Uncertain',      color: '#22c55e', desc: 'Green' },
  { range: '56–66', label: 'Leaning True',   color: '#93c5fd', desc: 'Light blue' },
  { range: '67–77', label: 'True',           color: '#60a5fa', desc: 'Blue' },
  { range: '78–88', label: 'Deeply True',    color: '#3b82f6', desc: 'Blue' },
  { range: '89–100',label: 'Absolute True',  color: '#2563eb', desc: 'Deep blue' },
];

const GRADIENT = 'linear-gradient(90deg, #dc2626, #fca5a5 25%, #22c55e 50%, #93c5fd 75%, #2563eb)';

interface Props {
  compact?: boolean;
}

export default function BeliefScale({ compact }: Props) {
  return (
    <div className="space-y-4">
      <div
        className="h-4 rounded-full w-full"
        style={{ background: GRADIENT }}
      />

      {!compact && (
        <div className="grid grid-cols-9 gap-1">
          {BANDS.map((b) => (
            <div key={b.label} className="text-center">
              <div
                className="w-full h-6 rounded-md mb-1.5"
                style={{ backgroundColor: b.color }}
              />
              <div className="text-[10px] font-mono text-muted-foreground leading-tight">
                {b.range}
              </div>
              <div className="text-[10px] font-medium text-foreground leading-tight mt-0.5">
                {b.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {compact && (
        <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
          <span style={{ color: '#dc2626' }}>Absolute False</span>
          <span style={{ color: '#22c55e' }}>Uncertain</span>
          <span style={{ color: '#2563eb' }}>Absolute True</span>
        </div>
      )}
    </div>
  );
}

export { BANDS, GRADIENT };
