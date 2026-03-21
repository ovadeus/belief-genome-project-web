// Radar chart for belief dimension categories
// Uses Chart.js — install: pnpm add chart.js react-chartjs-2

import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip,
} from 'chart.js';
import { CATEGORIES } from '@belief-genome/engine';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

interface Props {
  dimensionScores: Record<number, number>;
}

// Category ranges for computing averages
const CAT_RANGES: Record<string, [number, number]> = {
  epistemology:  [4, 13],
  spirituality:  [14, 28],
  morality:      [29, 43],
  politics:      [44, 63],
  social:        [64, 78],
  economics:     [79, 88],
  science_tech:  [89, 98],
  education:     [99, 103],
  health:        [104, 108],
  psychology:    [109, 118],
  relationships: [119, 127],
};

export default function RadarChart({ dimensionScores }: Props) {
  const catKeys = Object.keys(CATEGORIES);

  const averages = catKeys.map(cat => {
    const [lo, hi] = CAT_RANGES[cat];
    let sum = 0, count = 0;
    for (let i = lo; i <= hi; i++) {
      if (dimensionScores[i] !== undefined) {
        sum += dimensionScores[i];
        count++;
      }
    }
    return count > 0 ? sum / count : 5;
  });

  const data = {
    labels: catKeys.map(k => CATEGORIES[k].label),
    datasets: [{
      data: averages,
      backgroundColor: 'rgba(108, 143, 255, 0.15)',
      borderColor: '#6c8fff',
      borderWidth: 2,
      pointBackgroundColor: '#6c8fff',
      pointBorderColor: '#fff',
      pointBorderWidth: 1,
      pointRadius: 4,
    }],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      r: {
        min: 0,
        max: 9,
        ticks: {
          stepSize: 3,
          color: 'rgba(255,255,255,0.3)',
          backdropColor: 'transparent',
          font: { size: 10 },
        },
        grid: { color: 'rgba(255,255,255,0.08)' },
        angleLines: { color: 'rgba(255,255,255,0.08)' },
        pointLabels: {
          color: 'rgba(255,255,255,0.6)',
          font: { size: 10 },
        },
      },
    },
  };

  return <Radar data={data} options={options} />;
}
