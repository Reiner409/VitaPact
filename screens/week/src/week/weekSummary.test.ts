import { pillarRegistry } from '@vitapact/core/pillars';
import { DEFAULT_GOALS } from '@vitapact/core/storage';
import type { DailyEntry } from '@vitapact/core/storage';
import { describe, expect, it } from 'vitest';
import { summarizeWeek, toPillarGoals } from './weekSummary';

const day = (date: string, pillars: DailyEntry['pillars']): DailyEntry => ({
  date,
  pillars,
  updatedAt: `${date}T21:00:00.000Z`,
});

const perfectDay = (date: string) =>
  day(date, {
    sleep: { hours: 8, quality: 4 },
    training: { trained: true, type: 'gym', minutes: 60 },
    food: { rating: 5 },
    sun: { minutes: 30 },
  });

const WEEK_41 = [
  '2026-10-05',
  '2026-10-06',
  '2026-10-07',
  '2026-10-08',
  '2026-10-09',
  '2026-10-10',
  '2026-10-11',
];

describe('RF-09 week score and verdict band', () => {
  it('scores a perfect week with the weigh-in 100 in the top band', () => {
    const summary = summarizeWeek(WEEK_41.map(perfectDay), DEFAULT_GOALS, true);
    expect(summary).toMatchObject({ score: 100, band: 'greatShape' });
  });

  it('scores an empty week 0 in the lowest band', () => {
    expect(summarizeWeek([], DEFAULT_GOALS, false)).toMatchObject({
      score: 0,
      band: 'pauseWeek',
    });
  });

  it('places a half-logged week in a middle band', () => {
    const summary = summarizeWeek(WEEK_41.slice(0, 4).map(perfectDay), DEFAULT_GOALS, false);
    expect(summary.score).toBeGreaterThanOrEqual(50);
    expect(summary.score).toBeLessThan(70);
    expect(summary.band).toBe('solidBase');
  });

  it('ignores fields saved as null, as storage allows', () => {
    const summary = summarizeWeek(
      [day('2026-10-05', { training: { trained: false, type: null, minutes: null } })],
      DEFAULT_GOALS,
      false,
    );
    expect(summary.pillars.training).toEqual({ average: null, total: 0, daysOnGoal: 0 });
  });
});

describe('RF-08 pillar statistics of the week', () => {
  it('averages the summary field of each pillar and counts the days on goal', () => {
    const summary = summarizeWeek(
      [perfectDay('2026-10-05'), day('2026-10-06', { sleep: { hours: 6, quality: 2 } })],
      DEFAULT_GOALS,
      false,
    );
    expect(summary.pillars.sleep).toEqual({ average: 7, total: 14, daysOnGoal: 1 });
    expect(summary.logged).toBe(2);
  });
});

describe('RF-09 the profile goals drive the score', () => {
  it('maps every stored goal to its pillar and keeps the defaults for the rest', () => {
    expect(toPillarGoals({ sleepHours: 8, workoutsPerWeek: 4, sunMinutes: 30 })).toEqual({
      ...pillarRegistry.defaultGoals(),
      sleep: 8,
      training: 4,
      sun: 30,
    });
  });
});
