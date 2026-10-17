import { sampleReport } from '@vitapact/core/storage/testing';
import { describe, expect, it } from 'vitest';
import { historyOf, scoreOf, weightOf } from './friendHistory';

const week41 = sampleReport;
const week39 = {
  ...sampleReport,
  week: '2026-W39',
  summary: { ...sampleReport.summary, week: '2026-W39', score: 40 },
};

describe('F3-FR-08 RF-13 a friend history', () => {
  it('has the last 12 weeks, with a gap for a week without a report', () => {
    const points = historyOf([week39, week41], '2026-W41', scoreOf);
    expect(points).toHaveLength(12);
    expect(points.slice(-3)).toEqual([
      { week: '2026-W39', value: 40 },
      { week: '2026-W40', value: null },
      { week: '2026-W41', value: week41.summary.score },
    ]);
  });

  it('leaves the weight out when the friend hid it', () => {
    const hidden = { ...week41.summary };
    delete hidden.weight;
    delete hidden.delta;
    const points = historyOf([{ ...week41, summary: hidden }], '2026-W41', weightOf);
    expect(points.every(({ value }) => value === null)).toBe(true);
  });
});
