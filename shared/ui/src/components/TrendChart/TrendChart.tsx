import { Text, VisuallyHidden } from '@mantine/core';
import { useReducedMotion } from '@mantine/hooks';
import {
  CategoryScale,
  Chart,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
} from 'chart.js';
import { useEffect, useMemo, useRef } from 'react';
import { tokens } from '../../tokens';
import { Card } from '../Card/Card';
import { trendChartConfig, type TrendPoint } from './trendChartConfig';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale);

export interface TrendChartProps {
  /** Translated name of the chart, e.g. "Weight over the last 12 weeks". */
  label: string;
  points: TrendPoint[];
  /** Formats a value with its unit for screen readers, e.g. "78.4 kg". */
  formatValue: (value: number) => string;
  /** Translated text for a week with no value. */
  missingLabel: string;
}

const CHART_HEIGHT = tokens.space[7] * 4;

function useLineChart(points: TrendPoint[]) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion() ?? false;
  // Screens rebuild the points on every render; the chart is redrawn only when they change.
  const pointsKey = JSON.stringify(points);
  const config = useMemo(
    () => trendChartConfig(JSON.parse(pointsKey) as TrendPoint[], reducedMotion),
    [pointsKey, reducedMotion],
  );
  useEffect(() => {
    const context = canvas.current?.getContext('2d');
    if (!context) return;
    const chart = new Chart(context, config);
    return () => chart.destroy();
  }, [config]);
  return canvas;
}

/** Titled card with a line chart of weight or scores over the weeks; missing weeks stay gaps (section 6.2). */
export function TrendChart({ label, points, formatValue, missingLabel }: TrendChartProps) {
  const canvas = useLineChart(points);
  return (
    <Card>
      <Text component="h2" fw={tokens.font.weight.semibold} mb={tokens.space[3]}>
        {label}
      </Text>
      <div style={{ position: 'relative', height: CHART_HEIGHT }}>
        <canvas ref={canvas} role="img" aria-label={label} />
      </div>
      <VisuallyHidden>
        <dl>
          {points.map((point) => (
            <div key={point.label}>
              <dt>{point.label}</dt>
              <dd>{point.value === null ? missingLabel : formatValue(point.value)}</dd>
            </div>
          ))}
        </dl>
      </VisuallyHidden>
    </Card>
  );
}
