import type { DailyEntry } from '@vitapact/core/storage';
import { describe, expect, it } from 'vitest';
import { summarizeWeek } from './weekSummary';

const goals = { sleep: 7.5, training: 3, food: 4, sun: 20 };
const greatDay = (date: string): DailyEntry => ({
  date,
  pillars: {
    sleep: { hours: 8, quality: 5 },
    training: { trained: true, type: 'gym', minutes: 60 },
    food: { rating: 5 },
    sun: { minutes: 30 },
  },
  updatedAt: `${date}T21:00:00Z`,
});

describe('F3-WK-02 F3-WK-03 week summary', () => {
  it('RF-09 an empty week scores low, with the pause verdict and seven empty days', () => {
    const summary = summarizeWeek('2026-W42', [], goals, false);
    expect(summary.days).toHaveLength(7);
    expect(summary.days.every(({ score }) => score === null)).toBe(true);
    expect(summary.band).toBe('pauseWeek');
  });

  it('RF-08 RF-09 a full week on every goal with the weigh-in is in great shape', () => {
    const dates = ['12', '13', '14', '15', '16', '17', '18'].map((day) => `2026-10-${day}`);
    const summary = summarizeWeek('2026-W42', dates.map(greatDay), goals, true);
    expect(summary.score).toBe(100);
    expect(summary.band).toBe('greatShape');
    expect(summary.statistics.pillars.sleep?.daysOnGoal).toBe(7);
    expect(summary.days[0]).toMatchObject({ date: '2026-10-12', score: 100 });
  });
});
