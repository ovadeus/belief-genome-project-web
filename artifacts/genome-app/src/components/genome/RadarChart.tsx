import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip,
} from 'chart.js';
import type { Plugin, ChartOptions } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

import { CAT_ORDER, CAT_SHORT, DOMAIN_AXES, domainLabel } from './genome-utils';
import { useThemeColors } from '../../hooks/use-theme-colors';

const THEME_VARS = [
  '--text-primary',
  '--text-secondary',
  '--text-muted',
  '--text-faint',
  '--border-subtle',
  '--border-soft',
  '--accent-text',
] as const;

interface HistoryEntry {
  probeCategory: string;
  value: number;
}

interface Props {
  /** When true, the chart container expands to fill the viewport instead of using a fixed aspect ratio. */
  fullscreen?: boolean;
  history: HistoryEntry[];
}

const SEGMENT_COLORS = [
  '#dc2626', '#ef4444', '#f87171', '#fca5a5',
  '#22c55e',
  '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb',
];

function vertexColor(v: number | null): string {
  if (v == null) return 'rgba(255,255,255,0.18)';
  if (v <= 0.11) return SEGMENT_COLORS[0];
  if (v <= 0.22) return SEGMENT_COLORS[1];
  if (v <= 0.33) return SEGMENT_COLORS[2];
  if (v <= 0.44) return SEGMENT_COLORS[3];
  if (v <= 0.55) return SEGMENT_COLORS[4];
  if (v <= 0.66) return SEGMENT_COLORS[5];
  if (v <= 0.77) return SEGMENT_COLORS[6];
  if (v <= 0.88) return SEGMENT_COLORS[7];
  return SEGMENT_COLORS[8];
}

function activeSegmentIndex(v: number | null): number {
  if (v == null) return -1;
  if (v <= 0.11) return 0;
  if (v <= 0.22) return 1;
  if (v <= 0.33) return 2;
  if (v <= 0.44) return 3;
  if (v <= 0.55) return 4;
  if (v <= 0.66) return 5;
  if (v <= 0.77) return 6;
  if (v <= 0.88) return 7;
  return 8;
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function drawLEDMeter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  totalWidth: number,
  segHeight: number,
  value01: number | null,
  anchor: 'left' | 'right' | 'center',
  inactiveTint: string,
  inactiveAlpha: number,
) {
  const SEGMENTS = 9;
  const GAP = 2;
  const segWidth = (totalWidth - GAP * (SEGMENTS - 1)) / SEGMENTS;

  let startX: number;
  if (anchor === 'center') startX = x - totalWidth / 2;
  else if (anchor === 'left') startX = x;
  else startX = x - totalWidth;

  const activeIdx = activeSegmentIndex(value01);

  for (let i = 0; i < SEGMENTS; i++) {
    const sx = startX + i * (segWidth + GAP);
    ctx.save();
    if (i === activeIdx) {
      ctx.shadowColor = SEGMENT_COLORS[i];
      ctx.shadowBlur = 10;
      ctx.fillStyle = SEGMENT_COLORS[i];
      ctx.fillRect(sx, y, segWidth, segHeight);
      ctx.shadowBlur = 0;
      ctx.fillRect(sx, y, segWidth, segHeight);
    } else {
      ctx.fillStyle = value01 != null
        ? hexToRgba(SEGMENT_COLORS[i], inactiveAlpha)
        : inactiveTint;
      ctx.fillRect(sx, y, segWidth, segHeight);
    }
    ctx.restore();
  }

  const midX = startX + 4 * (segWidth + GAP) + segWidth / 2;
  ctx.save();
  ctx.strokeStyle = 'rgba(34,197,94,0.45)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(midX, y - 2);
  ctx.lineTo(midX, y + segHeight + 2);
  ctx.stroke();
  ctx.restore();
}

export default function RadarChart({ history, fullscreen = false }: Props) {
  // RadarChart is always rendered inside a `.viz-dark-island` wrapper (see
  // the JSX below), so its canvas always uses the dark palette regardless of
  // the page-level theme. We deliberately do NOT read theme from the document
  // root here — `useThemeColors` reads `document.documentElement` which would
  // pick up the page's light-mode values and ignore the local dark island.
  const themeColors = useThemeColors(THEME_VARS);
  void themeColors; // kept for future re-introduction of theme-aware coloring
  const isLight = false;

  const labelStrong = isLight ? '#2a2d38' : '#ffffff';
  const labelSoft = isLight ? '#4f5462' : 'rgba(255,255,255,0.7)';
  const tickColor = isLight ? '#9097a3' : 'rgba(255,255,255,0.35)';
  const gridColor = isLight ? '#e3e1d9' : 'rgba(255,255,255,0.06)';
  const angleColor = isLight ? '#d6d4cc' : 'rgba(255,255,255,0.1)';
  const inactiveTint = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';
  const inactiveAlpha = isLight ? 0.28 : 0.14;

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

  const labels = CAT_ORDER.map(() => '');
  const dataVals = CAT_ORDER.map(c => avgs[c] != null ? Math.round(avgs[c]! * 100) : null);
  const radarData = dataVals.map(v => v ?? 50);
  const hasData = dataVals.filter(v => v != null).length;
  const pointColors = CAT_ORDER.map(c => vertexColor(avgs[c]));

  const subtitle = hasData < 3
    ? `Answer more probes to fill the radar (${hasData}/${CAT_ORDER.length} categories)`
    : `${hasData} of ${CAT_ORDER.length} categories mapped`;

  const ranked = CAT_ORDER
    .filter(c => avgs[c] != null)
    .map(c => ({ cat: c, avg: avgs[c]!, dist: Math.abs(avgs[c]! - 0.5) }))
    .sort((a, b) => b.dist - a.dist)
    .slice(0, 3);

  const data = {
    labels,
    datasets: [
      {
        label: 'Superposition',
        data: CAT_ORDER.map(() => 50),
        backgroundColor: 'rgba(34,197,94,0.04)',
        borderColor: 'rgba(34,197,94,0.35)',
        borderDash: [4, 4],
        borderWidth: 1,
        pointRadius: 0,
        pointHoverRadius: 0,
        fill: true,
        order: 2,
      },
      {
        label: 'Your Position',
        data: radarData,
        backgroundColor: 'rgba(108,99,255,0.15)',
        borderColor: 'rgba(108,99,255,0.85)',
        pointBackgroundColor: pointColors,
        pointBorderColor: 'rgba(255,255,255,0.9)',
        pointBorderWidth: 1.5,
        pointRadius: 5,
        pointHoverRadius: 8,
        borderWidth: 2,
        order: 1,
      },
    ],
  };

  const options: ChartOptions<'radar'> = {
    responsive: true,
    // In fullscreen, let the chart fill its (explicit-height) container instead of
    // sizing to width÷1.25 — that's what was leaving so much black space above & below.
    maintainAspectRatio: !fullscreen,
    aspectRatio: 1.25,
    layout: { padding: { top: 48, bottom: 64, left: 130, right: 130 } },
    animation: { duration: 600, easing: 'easeInOutQuart' },
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 25,
          color: tickColor,
          backdropColor: 'transparent',
          font: { size: 9, family: "'Space Mono', monospace" },
          callback: (v) => {
            const n = typeof v === 'number' ? v : Number(v);
            if (n === 0) return '\u2190 pole';
            if (n === 25) return 'lean';
            if (n === 50) return 'superposition';
            if (n === 75) return 'lean';
            if (n === 100) return 'pole \u2192';
            return '';
          },
        },
        grid: { color: gridColor },
        angleLines: { color: angleColor },
        pointLabels: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        filter: (ctx) => ctx.datasetIndex === 1,
        callbacks: {
          title: (items) => CAT_SHORT[CAT_ORDER[items[0].dataIndex]] || '',
          label: (ctx) => {
            const cat = CAT_ORDER[ctx.dataIndex];
            const avg = avgs[cat];
            const cnt = (buckets[cat] || []).length;
            if (avg == null) return ' No data yet';
            const pct = Math.round(avg * 100);
            const lbl = domainLabel(cat, avg);
            const axis = DOMAIN_AXES[cat] || { left: 'left', right: 'right' };
            return [
              ` ${lbl}`,
              ` ${pct}% toward ${avg >= 0.5 ? axis.right : axis.left} pole`,
              ` ${cnt} response${cnt !== 1 ? 's' : ''}`,
            ];
          },
        },
        backgroundColor: 'rgba(20,20,40,0.95)',
        titleColor: '#fff',
        bodyColor: 'rgba(255,255,255,0.8)',
        borderColor: 'rgba(108,99,255,0.4)',
        borderWidth: 1,
        padding: 10,
      },
    },
  };

  const customLabelsPlugin: Plugin<'radar'> = {
    id: 'radarCustomLabels',
    afterDatasetsDraw(chart) {
      const scale = chart.scales.r as any;
      if (!scale) return;
      const ctx = chart.ctx;
      const cx = scale.xCenter;
      const cy = scale.yCenter;
      const radius = scale.drawingArea;

      CAT_ORDER.forEach((cat, i) => {
        const angle = scale.getIndexAngle(i) - Math.PI / 2;
        const labelDist = radius + 32;
        const lx = cx + Math.cos(angle) * labelDist;
        const ly = cy + Math.sin(angle) * labelDist;

        const dx = lx - cx;
        let align: 'left' | 'right' | 'center' = 'center';
        if (Math.abs(dx) >= 14) align = dx > 0 ? 'left' : 'right';

        const dy = ly - cy;
        const aboveCenter = dy < -8;
        const belowCenter = dy > 8;
        const textBaseY = aboveCenter ? ly - 8 : belowCenter ? ly + 8 : ly;

        ctx.save();
        ctx.textAlign = align;
        ctx.textBaseline = 'middle';

        ctx.fillStyle = labelStrong;
        ctx.font = '600 13px "DM Sans", "Helvetica Neue", sans-serif';
        ctx.fillText(CAT_SHORT[cat] || cat, lx, textBaseY);

        const axis = DOMAIN_AXES[cat];
        if (axis) {
          ctx.fillStyle = labelSoft;
          ctx.font = '300 11px "DM Sans", "Helvetica Neue", sans-serif';
          ctx.fillText(`${axis.left}  \u2194  ${axis.right}`, lx, textBaseY + 16);
        }

        drawLEDMeter(ctx, lx, textBaseY + 30, 96, 5, avgs[cat], align, inactiveTint, inactiveAlpha);
        ctx.restore();
      });
    },
  };

  return (
    <div data-theme="dark" className="viz-dark-island">
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
      }}>
        <span style={{
          fontSize: 11, fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
          letterSpacing: 1.5, color: 'var(--text-muted)',
        }}>
          World View Radar
        </span>
        <span
          data-testid="radar-subtitle"
          style={{
            fontSize: 10, fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
            letterSpacing: 1, color: 'var(--accent-strong)',
          }}
        >
          {subtitle}
        </span>
      </div>

      <p style={{
        fontSize: 11,
        color: 'var(--text-muted)',
        lineHeight: 1.55,
        marginBottom: 8,
        textAlign: 'center',
      }}>
        Each spoke plots your <strong style={{ color: 'var(--text-primary)' }}>ideological position</strong> between two poles.
        The dashed ring is <span style={{ color: '#22c55e' }}>superposition</span>;
        points pulled toward the center lean <span style={{ color: '#ef4444' }}>left-pole</span>,
        points pushed toward the edge lean <span style={{ color: '#3b82f6' }}>right-pole</span>.
      </p>

      <div style={{
        overflow: 'visible',
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
      }}>
        <div style={{
          width: '100%',
          // Cap width modestly in fullscreen so spoke labels don't fly off into the corners,
          // but let it breathe well past the 680px panel cap.
          maxWidth: fullscreen ? 1100 : 680,
          // Chart.js needs the parent to have explicit height when maintainAspectRatio is false.
          // Subtract header (~50) + container padding (~48) + section header (~36) + intro p (~52) + insight panel (~88) = ~274.
          height: fullscreen ? 'calc(100vh - 290px)' : undefined,
          minHeight: fullscreen ? 480 : undefined,
          position: 'relative',
          overflow: 'visible',
        }}>
          <Radar data={data} options={options} plugins={[customLabelsPlugin]} />
        </div>
      </div>

      <div
        data-testid="radar-insight"
        style={{
          marginTop: 10,
          padding: '10px 12px',
          background: 'var(--accent-soft)',
          border: '1px solid var(--accent-mid)',
          borderRadius: 6,
          fontSize: 12,
          lineHeight: 1.5,
        }}
      >
        {hasData < 3 ? (
          <span style={{ color: 'var(--text-muted)' }}>
            Answer probes across at least 3 categories to surface your strongest leans.
          </span>
        ) : (
          <>
            <span style={{
              color: 'var(--text-muted)',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
            }}>
              Strongest leans:
            </span>
            <br />
            {ranked.map((r, idx) => {
              const name = CAT_SHORT[r.cat] || r.cat;
              const lbl = domainLabel(r.cat, r.avg);
              const col = r.avg >= 0.56 ? '#60a5fa' : r.avg <= 0.44 ? '#ef4444' : '#22c55e';
              return (
                <span key={r.cat}>
                  <span style={{ color: col, fontWeight: 600 }}>{lbl}</span>
                  {' '}
                  <span style={{ color: 'var(--text-muted)' }}>({name})</span>
                  {idx < ranked.length - 1 && (
                    <span style={{ color: 'var(--text-muted)' }}>{' \u00b7 '}</span>
                  )}
                </span>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
