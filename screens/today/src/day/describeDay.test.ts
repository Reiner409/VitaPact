import { describe, expect, it } from 'vitest';
import { describeDay } from './describeDay';

describe('F3-TD-01 day header facts', () => {
  it('counts six days to Sunday on a Monday', () => {
    expect(describeDay('2026-10-12')).toEqual({
      date: '2026-10-12',
      weekNumber: 42,
      daysToSunday: 6,
    });
  });

  it('counts no days on Sunday', () => {
    expect(describeDay('2026-10-18').daysToSunday).toBe(0);
  });

  it('takes the week number of the ISO year at the turn of the year', () => {
    expect(describeDay('2026-12-31').weekNumber).toBe(53);
    expect(describeDay('2027-01-03').weekNumber).toBe(53);
    expect(describeDay('2027-01-04').weekNumber).toBe(1);
  });
});
