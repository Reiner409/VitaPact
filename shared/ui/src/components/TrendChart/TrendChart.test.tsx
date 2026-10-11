import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../testing';
import { renderWithTheme } from '../../testing/renderWithTheme';
import { TrendChart } from './TrendChart';
import { trendChartConfig, type TrendPoint } from './trendChartConfig';

const WEIGHTS: TrendPoint[] = [
  { label: 'W38', value: 79.1 },
  { label: 'W39', value: null },
  { label: 'W40', value: 78.4 },
];

function renderChart() {
  renderWithTheme(
    <TrendChart
      label="Weight over the last 12 weeks"
      points={WEIGHTS}
      formatValue={(value) => `${value.toFixed(1)} kg`}
      missingLabel="No weigh-in"
    />,
  );
}

describe('F2-18 TrendChart', () => {
  // jsdom has no canvas; the chart itself is drawn only in the browser.
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('RF-08 keeps a missing week as a gap in the line, never joining across it', () => {
    const { data } = trendChartConfig(WEIGHTS, false);
    expect(data.labels).toEqual(['W38', 'W39', 'W40']);
    expect(data.datasets[0]?.data).toEqual([79.1, null, 78.4]);
    expect(data.datasets[0]?.spanGaps).toBe(false);
  });

  it('turns animations off when the system asks for reduced motion', () => {
    expect(trendChartConfig(WEIGHTS, true).options?.animation).toBe(false);
    expect(trendChartConfig(WEIGHTS, false).options?.animation).toEqual({ duration: 250 });
  });

  it('RF-08 is an image named by its label', () => {
    renderChart();
    expect(screen.getByRole('img', { name: 'Weight over the last 12 weeks' })).toBeInTheDocument();
  });

  it('RNF-10 lists every week for screen readers, the gap included', () => {
    renderChart();
    expect(screen.getAllByRole('term').map((term) => term.textContent)).toEqual([
      'W38',
      'W39',
      'W40',
    ]);
    expect(screen.getAllByRole('definition').map((value) => value.textContent)).toEqual([
      '79.1 kg',
      'No weigh-in',
      '78.4 kg',
    ]);
  });

  it('RNF-10 has no axe violations', async () => {
    renderChart();
    expect(await axeViolations()).toEqual([]);
  });
});
