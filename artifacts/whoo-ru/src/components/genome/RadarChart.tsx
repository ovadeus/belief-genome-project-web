// World View Radar — Chart.js radar with 9 category axes
// Matches desktop: same categories, same colors, same tooltips
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip,
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

import { CAT_ORDER, CAT_SHORT, DOMAIN_AXES, domainLabel } from './genome-utils';

interface HistoryEntry {
  probeCategory: string;
  value: number;
}

interface Props {
  history: HistoryEntry[];
}

export default function RadarChart({ history }: Props) {
  // Compute category averages from history (value 0-1 scale)
  const buckets: Record<string, number[]> = {};
  for (const h of history) {
    const cat = h.probeCategory || 'life';
    if (!buckets[cat]) buckets[cat] = [];
    buckets[cat].push(h.value);
  }
  const avgs: Record<string, number | null> = {};
  for (const cat of CAT_ORDER) {
    if (buckets[cat] && buckets[cat].length > 0) {
      avgs[cat] = buckets[cat].reduce((s, v) => s + v, 0) / buckets[cat].length;
    } else {
      avgs[cat] = null;
    }
  }

  const labels = CAT_ORDER.map(c => CAT_SHORT[c] || c);
  const dataVals = CAT_ORDER.map(c => avgs[c] != null ? Math.round(avgs[c]! * 100) : null);
  const radarData = dataVals.map(v => v ?? 50);
  const hasData = dataVals.filter(v => v != null).length;

  const subtitle = hasData < 3
    ? `Answer more probes to fill the radar (${hasData}/${CAT_ORDER.length} categories)`
    : `${hasData} of ${CAT_ORDER.length} categories mapped`;

  const data = {
    labels,
    datasets: [{
      label: 'Your Position',
      data: radarData,
      backgroundColor: 'rgba(108, 99, 255, 0.15)',
      borderColor: 'rgba(108, 99, 255, 0.8)',
      pointBackgroundColor: CAT_ORDER.map(c => {
        const v = avgs[c];
        if (v == null) return 'rgba(255,255,255,0.15)';
        return v >= 0.6 ? '#44ff88' : v <= 0.4 ? '#ff4444' : '#aaaaaa';
      }),
      pointRadius: 5,
      pointHoverRadius: 7,
      borderWidth: 2,
    }],
  };

  const options = {
    responsive: true,
    animation: { duration: 600, easing: 'easeInOutQuart' as const },
    scales: {
      r: {
        min: 0, max: 100,
        ticks: {
          stepSize: 25,
          color: 'rgba(255,255,255,0.2)',
          backdropColor: 'transparent',
          font: { size: 9, family: "'Space Mono', monospace" },
          callback: (v: number) => v === 50 ? 'Neutral' : v === 0 ? 'False' : v === 100 ? 'True' : '',
        },
        grid: { color: 'rgba(255,255,255,0.07)' },
        angleLines: { color: 'rgba(255,255,255,0.07)' },
        pointLabels: {
          color: 'rgba(255,255,255,0.6)',
          font: { size: 11, family: "'DM Sans', sans-serif" },
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const cat = CAT_ORDER[ctx.dataIndex];
            const avg = avgs[cat];
            const cnt = (buckets[cat] || []).length;
            if (avg == null) return ' No data yet';
            const pct = Math.round(avg * 100);
            const lbl = domainLabel(cat, avg);
            return ` ${lbl} (${pct}%) · ${cnt} response${cnt !== 1 ? 's' : ''}`;
          },
        },
        backgroundColor: 'rgba(20,20,40,0.95)',
        titleColor: '#fff',
        bodyColor: 'rgba(255,255,255,0.7)',
        borderColor: 'rgba(108,99,255,0.4)',
        borderWidth: 1,
      },
    },
  };

  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
      }}>
        <span style={{
          fontSize: 11, fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
          letterSpacing: 1.5, color: 'rgba(255,255,255,0.5)',
        }}>
          World View Radar
        </span>
        <span style={{
          fontSize: 10, fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
          letterSpacing: 1, color: 'rgba(108,143,255,0.6)',
        }}>
          {subtitle}
        </span>
      </div>
      <Radar data={data} options={options as any} />
    </div>
  );
}
