// Belief Drift Over Time — Chart.js line chart with D/W/M/Q/Y navigation
import { useState, useEffect, useRef, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Filler, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface HistoryEntry {
  id: number;
  probeText: string;
  probeCategory: string;
  probeSource?: string;
  value: number;
  createdAt: string;
}

type Period = 'day' | 'week' | 'month' | 'quarter' | 'year';

function getTimelineWindow(period: Period, offset: number) {
  const now = new Date();
  let start: Date, end: Date, label: string;

  if (period === 'day') {
    const base = new Date(now); base.setHours(0, 0, 0, 0); base.setDate(base.getDate() + offset);
    start = new Date(base);
    end = new Date(base); end.setDate(end.getDate() + 1);
    label = start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  } else if (period === 'week') {
    const base = new Date(now); base.setHours(0, 0, 0, 0);
    base.setDate(base.getDate() - base.getDay()); base.setDate(base.getDate() + offset * 7);
    start = new Date(base);
    end = new Date(base); end.setDate(end.getDate() + 7);
    const endDisp = new Date(end); endDisp.setDate(endDisp.getDate() - 1);
    const fmt: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    label = `${start.toLocaleDateString('en-US', fmt)} – ${endDisp.toLocaleDateString('en-US', fmt)}`;
  } else if (period === 'month') {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    start = new Date(d.getFullYear(), d.getMonth(), 1);
    end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    label = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } else if (period === 'quarter') {
    const curQ = Math.floor(now.getMonth() / 3);
    const totalQ = now.getFullYear() * 4 + curQ + offset;
    const qYear = Math.floor(totalQ / 4);
    const q = ((totalQ % 4) + 4) % 4;
    start = new Date(qYear, q * 3, 1);
    end = new Date(qYear, q * 3 + 3, 1);
    label = `Q${q + 1} ${qYear}`;
  } else {
    const y = now.getFullYear() + offset;
    start = new Date(y, 0, 1);
    end = new Date(y + 1, 0, 1);
    label = `${y}`;
  }

  return { start, end, label };
}

interface Props {
  history: HistoryEntry[];
}

export default function Timeline({ history }: Props) {
  const [period, setPeriod] = useState<Period>('week');
  const [offset, setOffset] = useState(0);
  const chartRef = useRef<any>(null);

  const win = getTimelineWindow(period, offset);

  // Filter to window, oldest first
  const allSorted = [...history].reverse();
  const windowed = allSorted.filter(h => {
    const d = new Date(h.createdAt);
    return d >= win.start && d < win.end;
  });

  const handlePeriod = useCallback((p: Period) => { setPeriod(p); setOffset(0); }, []);
  const shiftBack = useCallback(() => setOffset(o => o - 1), []);
  const shiftForward = useCallback(() => setOffset(o => Math.min(0, o + 1)), []);

  if (windowed.length < 2) {
    return (
      <div>
        <TimelineToolbar period={period} onPeriod={handlePeriod}
          label={win.label} count={windowed.length} offset={offset}
          onBack={shiftBack} onForward={shiftForward} />
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: 60 }}>
          {windowed.length === 0
            ? `No responses in this ${period}.`
            : 'Need at least 2 responses to draw a chart.'}
        </div>
      </div>
    );
  }

  const raw = windowed.map(h => Math.round(h.value * 100));
  const xLabels = windowed.map(h =>
    new Date(h.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  );

  // Rolling 5-point average
  const rolling = raw.map((_, i) => {
    const w = raw.slice(Math.max(0, i - 4), i + 1);
    return Math.round(w.reduce((s, v) => s + v, 0) / w.length);
  });

  const data = {
    labels: xLabels,
    datasets: [
      {
        label: 'Each Response',
        data: raw,
        borderColor: 'rgba(108,99,255,0.3)',
        backgroundColor: 'transparent',
        pointRadius: 3,
        pointBackgroundColor: raw.map(v => v >= 60 ? '#44ff88' : v <= 40 ? '#ff4444' : '#aaaaaa'),
        borderWidth: 1,
        tension: 0.3,
      },
      {
        label: 'Rolling Avg',
        data: rolling,
        borderColor: 'rgba(108,99,255,0.9)',
        backgroundColor: 'rgba(108,99,255,0.08)',
        pointRadius: 0,
        borderWidth: 2.5,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    animation: { duration: 400 },
    scales: {
      x: {
        ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 }, maxTicksLimit: 12 },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
      y: {
        min: 0, max: 100,
        ticks: {
          color: 'rgba(255,255,255,0.3)',
          font: { size: 10, family: "'Space Mono', monospace" },
          callback: (v: number) => v === 50 ? 'Neutral' : v === 0 ? 'Disagree' : v === 100 ? 'Agree' : v,
        },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
    },
    plugins: {
      legend: {
        labels: { color: 'rgba(255,255,255,0.5)', font: { size: 11 }, boxWidth: 14 },
      },
      tooltip: {
        backgroundColor: 'rgba(20,20,40,0.95)',
        titleColor: '#fff',
        bodyColor: 'rgba(255,255,255,0.7)',
        callbacks: {
          title: (items: any[]) => {
            const h = windowed[items[0].dataIndex];
            return h ? `"${h.probeText?.substring(0, 52)}..."` : '';
          },
          label: (ctx: any) => {
            const v = ctx.parsed.y;
            const lbl = v >= 65 ? 'Likely true' : v <= 35 ? 'Unlikely true' : 'Uncertain';
            return ` ${ctx.dataset.label}: ${v}% — ${lbl}`;
          },
        },
      },
    },
  };

  return (
    <div>
      <TimelineToolbar period={period} onPeriod={handlePeriod}
        label={win.label} count={windowed.length} offset={offset}
        onBack={shiftBack} onForward={shiftForward} />
      <Line ref={chartRef} data={data} options={options as any} />
    </div>
  );
}

/* ── Toolbar sub-component ─────────────────────────────────── */
function TimelineToolbar({ period, onPeriod, label, count, offset, onBack, onForward }: {
  period: Period; onPeriod: (p: Period) => void;
  label: string; count: number; offset: number;
  onBack: () => void; onForward: () => void;
}) {
  const periods: { key: Period; label: string }[] = [
    { key: 'day', label: 'D' }, { key: 'week', label: 'W' }, { key: 'month', label: 'M' },
    { key: 'quarter', label: 'Q' }, { key: 'year', label: 'Y' },
  ];

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: 16, flexWrap: 'wrap', gap: 8,
    }}>
      <span style={{
        fontSize: 11, fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
        letterSpacing: 1.5, color: 'rgba(255,255,255,0.5)',
      }}>
        Belief Drift Over Time
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Period tabs */}
        <div style={{
          display: 'flex', gap: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: 2,
        }}>
          {periods.map(p => (
            <button
              key={p.key}
              onClick={() => onPeriod(p.key)}
              style={{
                padding: '4px 10px', borderRadius: 4, border: 'none', fontSize: 11,
                fontFamily: "'Space Mono', monospace", cursor: 'pointer',
                background: period === p.key ? 'rgba(108,143,255,0.25)' : 'transparent',
                color: period === p.key ? '#6c8fff' : 'rgba(255,255,255,0.4)',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <button onClick={onBack} style={navBtnStyle}>&#8592;</button>
        <span style={{
          fontSize: 11, fontFamily: "'Space Mono', monospace", color: 'rgba(255,255,255,0.5)',
          minWidth: 120, textAlign: 'center',
        }}>
          {label}
        </span>
        <button onClick={onForward} disabled={offset >= 0} style={{
          ...navBtnStyle, opacity: offset >= 0 ? 0.3 : 1,
        }}>&#8594;</button>

        <span style={{
          fontSize: 10, fontFamily: "'Space Mono', monospace", color: 'rgba(255,255,255,0.35)',
        }}>
          {count} response{count !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 4, padding: '4px 8px', cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
  fontSize: 12,
};
