import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axeViolations } from '../../testing';
import { renderWithTheme } from '../../testing/renderWithTheme';
import { PillarSummary, type PillarSummaryProps } from './PillarSummary';

const sleep: PillarSummaryProps = {
  pillar: { color: 'sleep', icon: 'sleep' },
  name: 'Sleep',
  averageLabel: '7.2 h average',
  daysOnGoal: 5,
  daysOnGoalLabel: '5 of 7 days on target',
};

const bar = () => document.querySelector<HTMLElement>('[data-bar="days-on-goal"]');

describe('F2-18 PillarSummary', () => {
  it('RF-08 shows the weekly average and the days on target of one pillar', () => {
    renderWithTheme(<PillarSummary {...sleep} />);
    expect(screen.getByText('Sleep')).toBeInTheDocument();
    expect(screen.getByText('7.2 h average')).toBeInTheDocument();
    expect(screen.getByText('5 of 7 days on target')).toBeInTheDocument();
  });

  it('G4.2 uses the pillar colour for the icon and the bar, never for the text', () => {
    renderWithTheme(<PillarSummary {...sleep} />);
    expect(document.querySelector('[data-icon="sleep"]')?.parentElement).toHaveStyle({
      color: 'var(--vp-color-pillar-sleep)',
    });
    expect(bar()).toHaveStyle({ backgroundColor: 'var(--vp-color-pillar-sleep)', width: '71%' });
    expect(screen.getByText('7.2 h average')).toHaveStyle({ color: 'var(--vp-color-text)' });
  });

  it('RF-23 shows a pillar without its own tokens in the primary green', () => {
    renderWithTheme(
      <PillarSummary {...sleep} pillar={{ color: 'hydration', icon: 'hydration' }} />,
    );
    expect(document.querySelector('[data-icon="pillar"]')).not.toBeNull();
    expect(bar()).toHaveStyle({ backgroundColor: 'var(--vp-color-primary)' });
  });

  it('keeps the bar inside the track', () => {
    renderWithTheme(<PillarSummary {...sleep} daysOnGoal={9} />);
    expect(bar()).toHaveStyle({ width: '100%' });
  });

  it('RNF-10 has no axe violations', async () => {
    renderWithTheme(<PillarSummary {...sleep} />);
    expect(await axeViolations()).toEqual([]);
  });
});
