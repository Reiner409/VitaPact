import { describe, expect, it } from 'vitest';
import { weeklyStakeIndex } from './stake';

describe('F3-FR-10 RF-25 the stake of the week', () => {
  it('depends on the week alone, so every phone picks the same stake', () => {
    // 2026-W42 starts 145 weeks after Monday 1 January 2024, and 145 mod 8 is 1.
    expect(weeklyStakeIndex('2026-W42', 8)).toBe(1);
  });

  it('changes every week and goes through the whole list before repeating', () => {
    const weeks = ['2026-W40', '2026-W41', '2026-W42', '2026-W43'];
    const indexes = weeks.map((week) => weeklyStakeIndex(week, 4));
    expect(new Set(indexes).size).toBe(4);
  });

  it('never repeats two weeks in a row across the new year, week 53 included', () => {
    expect(weeklyStakeIndex('2026-W53', 8)).not.toBe(weeklyStakeIndex('2027-W01', 8));
    expect(weeklyStakeIndex('2027-W52', 8)).not.toBe(weeklyStakeIndex('2028-W01', 8));
  });

  it('stays inside the list, also for weeks before the counting starts', () => {
    for (const week of ['2019-W01', '2023-W52', '2024-W01', '2031-W30']) {
      const index = weeklyStakeIndex(week, 8);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(8);
    }
  });

  it('refuses an empty list', () => {
    expect(() => weeklyStakeIndex('2026-W42', 0)).toThrow(RangeError);
  });
});
