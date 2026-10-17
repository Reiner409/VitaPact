import { describe, expect, it } from 'vitest';
import type { DailyEntry } from '@vitapact/core/storage';
import { weekDaysOf } from './weekDays';

const goals = { sleep: 7.5, training: 3, food: 4, sun: 20 };
const logged = (date: string): DailyEntry => ({
  date,
  pillars: {
    sleep: { hours: 8, quality: 4 },
    training: { trained: true, type: 'gym', minutes: 45 },
    food: { rating: 5 },
    sun: { minutes: 30 },
  },
  updatedAt: `${date}T21:00:00Z`,
});

describe('F3-TD-07 week strip', () => {
  it('lists Monday to Sunday with a score for the three logged days', () => {
    const entries = ['2026-10-12', '2026-10-14', '2026-10-15'].map(logged);
    const days = weekDaysOf('2026-10-15', entries, goals);
    expect(days.map(({ date }) => date)).toEqual([
      '2026-10-12',
      '2026-10-13',
      '2026-10-14',
      '2026-10-15',
      '2026-10-16',
      '2026-10-17',
      '2026-10-18',
    ]);
    expect(days.filter(({ score }) => score !== null)).toHaveLength(3);
    expect(days[0]?.score).toBeGreaterThan(0);
    expect(days[1]?.score).toBeNull();
  });
});
