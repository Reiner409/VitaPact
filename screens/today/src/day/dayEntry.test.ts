import { pillarRegistry } from '@vitapact/core/pillars';
import { describe, expect, it } from 'vitest';
import { dayEntryOf } from './dayEntry';

const pillars = pillarRegistry.list();
const savedAt = new Date('2026-10-12T21:00:00Z');
const complete = {
  sleep: { hours: 7.5, quality: 4 },
  training: { trained: false },
  food: { rating: 4 },
  sun: { minutes: 20 },
};

describe('F3-TD-06 the entry saved for the day', () => {
  it('RF-03 keeps every answer of a complete day', () => {
    expect(dayEntryOf(pillars, complete, '2026-10-12', savedAt)).toEqual({
      date: '2026-10-12',
      pillars: complete,
      updatedAt: '2026-10-12T21:00:00.000Z',
    });
  });

  it('RF-03 drops the workout details once training is switched to no', () => {
    const values = { ...complete, training: { trained: false, type: 'gym', minutes: 45 } };
    expect(dayEntryOf(pillars, values, '2026-10-12', savedAt)?.pillars.training).toEqual({
      trained: false,
    });
  });

  it('RF-03 refuses a day with an empty or invalid field', () => {
    expect(dayEntryOf(pillars, { ...complete, sun: {} }, '2026-10-12', savedAt)).toBeUndefined();
    const offStep = { ...complete, sleep: { hours: 7.3, quality: 4 } };
    expect(dayEntryOf(pillars, offStep, '2026-10-12', savedAt)).toBeUndefined();
  });
});
