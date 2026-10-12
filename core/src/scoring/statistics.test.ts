import { describe, expect, it } from 'vitest';
import type { DayValues, Goals } from '../pillars';
import { weekStatistics, weightSeries } from './index';

const goals: Goals = { sleep: 7.5, training: 3, food: 4, sun: 20 };

const days: DayValues[] = [
  {
    sleep: { hours: 8, quality: 4 },
    training: { trained: true, type: 'gym', minutes: 60 },
    food: { rating: 5 },
    sun: { minutes: 30 },
  },
  {
    sleep: { hours: 6, quality: 2 },
    training: { trained: false },
    food: { rating: 3 },
    sun: { minutes: 10 },
  },
  { sleep: { hours: 7.5, quality: 3 }, training: { trained: true, type: 'running', minutes: 30 } },
];

describe('RF-08 week statistics', () => {
  it('counts the logged days', () => {
    expect(weekStatistics(days, goals).logged).toBe(3);
  });

  it('averages each pillar over the days that have a value, skipping missing days', () => {
    const { pillars } = weekStatistics(days, goals);
    expect(pillars.sleep?.average).toBeCloseTo(7.1667, 4);
    expect(pillars.training?.average).toBe(45);
    expect(pillars.food?.average).toBe(4);
    expect(pillars.sun?.average).toBe(20);
  });

  it('totals each pillar, e.g. the minutes of training', () => {
    expect(weekStatistics(days, goals).pillars.training?.total).toBe(90);
  });

  it('counts the days on goal of each pillar', () => {
    const { pillars } = weekStatistics(days, goals);
    expect(pillars.sleep?.daysOnGoal).toBe(2);
    expect(pillars.training?.daysOnGoal).toBe(2);
    expect(pillars.food?.daysOnGoal).toBe(1);
    expect(pillars.sun?.daysOnGoal).toBe(1);
  });

  it('has no average, rather than zero, for a pillar never logged', () => {
    const { logged, pillars } = weekStatistics([], goals);
    expect(logged).toBe(0);
    expect(pillars.sun).toEqual({ average: null, total: 0, daysOnGoal: 0 });
  });
});

describe('RF-08 weight over the last 12 weeks', () => {
  it('gives one point per week, oldest first, ending with the given week', () => {
    const series = weightSeries('2026-W41', []);
    expect(series).toHaveLength(12);
    expect(series[0]?.week).toBe('2026-W30');
    expect(series[11]?.week).toBe('2026-W41');
  });

  it('places each weigh-in on its week, with gaps for the weeks without one', () => {
    const series = weightSeries('2026-W41', [
      { week: '2026-W41', weightKg: 78.4 },
      { week: '2026-W30', weightKg: 80.1 },
      { week: '2026-W35', weightKg: 79.2 },
    ]);

    expect(series[0]).toEqual({ week: '2026-W30', weightKg: 80.1 });
    expect(series[5]).toEqual({ week: '2026-W35', weightKg: 79.2 });
    expect(series[11]).toEqual({ week: '2026-W41', weightKg: 78.4 });
    expect(series.filter((point) => point.weightKg === null)).toHaveLength(9);
  });

  it('shows a week without a weigh-in as a gap, never as zero', () => {
    expect(weightSeries('2026-W41', []).every((point) => point.weightKg === null)).toBe(true);
  });

  it('crosses the year boundary, including a 53-week year', () => {
    const weeks = weightSeries('2027-W02', []).map((point) => point.week);
    expect(weeks.slice(-4)).toEqual(['2026-W52', '2026-W53', '2027-W01', '2027-W02']);
    expect(weeks[0]).toBe('2026-W44');
  });

  it('ignores weigh-ins outside the 12 weeks', () => {
    const series = weightSeries('2026-W41', [{ week: '2026-W29', weightKg: 85 }]);
    expect(series.some((point) => point.weightKg === 85)).toBe(false);
  });
});
