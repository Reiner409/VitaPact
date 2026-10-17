import type { DailyEntry } from '@vitapact/core/storage';
import { sampleEntry, sampleProfile } from '@vitapact/core/storage/testing';
import { describe, expect, it } from 'vitest';
import { ownRankedReports, rankingWeekOf } from './ownReports';

const day = (date: string): DailyEntry => ({ ...sampleEntry, date });

describe('F3-FR-05 ranking week', () => {
  it('RF-13 shows the week ending today on Sunday', () => {
    expect(rankingWeekOf('2026-10-18')).toBe('2026-W42');
  });

  it('RF-13 shows the week that ended last Sunday on the other days', () => {
    expect(rankingWeekOf('2026-10-19')).toBe('2026-W42');
    expect(rankingWeekOf('2026-10-24')).toBe('2026-W42');
  });
});

describe('F3-FR-05 your own row', () => {
  const weighIns = [
    { week: '2026-W41', weightKg: 70, measuredOn: '2026-10-11', fastingConfirmed: true },
    { week: '2026-W42', weightKg: 69.6, measuredOn: '2026-10-18', fastingConfirmed: true },
  ];

  it('RF-13 scores your logged weeks with the previous score and weight change', () => {
    const reports = ownRankedReports(
      sampleProfile,
      [
        { week: '2026-W41', entries: [day('2026-10-06')] },
        { week: '2026-W42', entries: [day('2026-10-12'), day('2026-10-13')] },
      ],
      weighIns,
    );
    expect(reports.map(({ week, logged }) => [week, logged])).toEqual([
      ['2026-W41', 1],
      ['2026-W42', 2],
    ]);
    const [first, second] = reports;
    expect(second).toMatchObject({ uid: sampleProfile.userId, nick: 'Rei', delta: -0.4 });
    expect(second?.prevScore).toBe(first?.score);
  });

  it('RF-14 leaves out a week with nothing logged, so you show as waiting', () => {
    expect(ownRankedReports(sampleProfile, [{ week: '2026-W42', entries: [] }], [])).toEqual([]);
  });
});
