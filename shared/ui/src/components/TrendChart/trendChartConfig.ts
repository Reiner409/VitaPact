import type { ChartConfiguration } from 'chart.js';
import { tokens } from '../../tokens';

export interface TrendPoint {
  /** Translated label of the point on the x axis, e.g. "W38" or "Oct 4". */
  label: string;
  /** `null` for a week with no value: the line breaks there instead of inventing one. */
  value: number | null;
}

const { color, font } = tokens;

const axisTicks = { color: color.textMuted, font: { family: font.family, size: font.small.size } };

/** Chart.js settings of the trend line, drawn with the design tokens (Chart.js reads no CSS). */
export function trendChartConfig(
  points: TrendPoint[],
  reducedMotion: boolean,
): ChartConfiguration<'line', Array<number | null>, string> {
  return {
    type: 'line',
    data: {
      labels: points.map((point) => point.label),
      datasets: [
        {
          data: points.map((point) => point.value),
          spanGaps: false,
          borderColor: color.primaryStrong,
          backgroundColor: color.primaryStrong,
          borderWidth: tokens.border.strongWidth,
          pointRadius: tokens.space[1] - 1,
          tension: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: reducedMotion ? false : { duration: tokens.motion.base },
      events: [],
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: { grid: { display: false }, ticks: axisTicks },
        y: { grid: { color: color.border }, ticks: axisTicks },
      },
    },
  };
}
