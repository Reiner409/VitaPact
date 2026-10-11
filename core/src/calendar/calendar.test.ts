import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  addDays,
  daysToSunday,
  isSunday,
  isoWeekOf,
  mondayOf,
  monthOfWeek,
  parseCalendarDate,
  parseIsoWeek,
  previousWeek,
  sundayOf,
  toCalendarDate,
  weighInCatchUpDeadline,
} from './index';

describe('F2-01 ISO week of a day (section 8)', () => {
  it('numbers the weeks Monday to Sunday', () => {
    expect(isoWeekOf('2026-10-05')).toBe('2026-W41');
    expect(isoWeekOf('2026-10-11')).toBe('2026-W41');
    expect(isoWeekOf('2026-10-12')).toBe('2026-W42');
  });

  it('pads single-digit weeks', () => {
    expect(isoWeekOf('2026-03-04')).toBe('2026-W10');
    expect(isoWeekOf('2026-02-04')).toBe('2026-W06');
  });

  it('puts the last days of December in week 01 of the next year', () => {
    expect(isoWeekOf('2025-12-29')).toBe('2026-W01');
    expect(isoWeekOf('2026-01-04')).toBe('2026-W01');
  });

  it('puts the first days of January in week 53 of the previous year', () => {
    expect(isoWeekOf('2026-12-31')).toBe('2026-W53');
    expect(isoWeekOf('2027-01-03')).toBe('2026-W53');
    expect(isoWeekOf('2027-01-04')).toBe('2027-W01');
  });

  it('ends a 52-week year on W52', () => {
    expect(isoWeekOf('2027-12-31')).toBe('2027-W52');
    expect(isoWeekOf('2028-01-02')).toBe('2027-W52');
    expect(isoWeekOf('2028-01-03')).toBe('2028-W01');
  });
});

describe('F2-01 Monday and Sunday of a week (section 8)', () => {
  it('finds the days that open and close the week', () => {
    expect(mondayOf('2026-W41')).toBe('2026-10-05');
    expect(sundayOf('2026-W41')).toBe('2026-10-11');
  });

  it('crosses the year boundary', () => {
    expect(mondayOf('2026-W01')).toBe('2025-12-29');
    expect(sundayOf('2026-W53')).toBe('2027-01-03');
  });

  it('goes back one week, also across the year boundary', () => {
    expect(previousWeek('2026-W41')).toBe('2026-W40');
    expect(previousWeek('2027-W01')).toBe('2026-W53');
    expect(previousWeek('2028-W01')).toBe('2027-W52');
  });
});

describe('D30 month of a week is the month of its Sunday', () => {
  it('keeps a week inside one month in that month', () => {
    expect(monthOfWeek('2026-W41')).toBe('2026-10');
  });

  it('gives a week across two months to the month of its Sunday', () => {
    expect(monthOfWeek('2026-W44')).toBe('2026-11');
    expect(monthOfWeek('2026-W40')).toBe('2026-10');
  });

  it('gives a week across two years to the year of its Sunday', () => {
    expect(monthOfWeek('2026-W53')).toBe('2027-01');
  });
});

describe('F2-01 days to Sunday', () => {
  it('counts down from Monday to Sunday', () => {
    expect(daysToSunday('2026-10-05')).toBe(6);
    expect(daysToSunday('2026-10-09')).toBe(2);
    expect(daysToSunday('2026-10-11')).toBe(0);
  });

  it('tells Sunday apart from the other days', () => {
    expect(isSunday('2026-10-11')).toBe(true);
    expect(isSunday('2026-10-10')).toBe(false);
    expect(isSunday('2026-10-12')).toBe(false);
  });
});

describe('RF-07 weigh-in catch-up deadline', () => {
  it('is the Tuesday after the Sunday of the week', () => {
    expect(weighInCatchUpDeadline('2026-W41')).toBe('2026-10-13');
  });

  it('crosses month and year boundaries', () => {
    expect(weighInCatchUpDeadline('2026-W44')).toBe('2026-11-03');
    expect(weighInCatchUpDeadline('2026-W53')).toBe('2027-01-05');
  });
});

describe('F2-01 dates across a daylight saving change', () => {
  const originalZone = process.env.TZ;

  beforeAll(() => {
    process.env.TZ = 'Europe/Rome';
  });

  afterAll(() => {
    if (originalZone === undefined) delete process.env.TZ;
    else process.env.TZ = originalZone;
  });

  it('reads the local day of a moment, late at night and early in the morning', () => {
    expect(toCalendarDate(new Date(2026, 2, 29, 23, 30))).toBe('2026-03-29');
    expect(toCalendarDate(new Date(2026, 9, 25, 0, 30))).toBe('2026-10-25');
    expect(toCalendarDate(new Date(2026, 9, 25, 23, 59))).toBe('2026-10-25');
  });

  it('adds whole days over the 23-hour and 25-hour days', () => {
    expect(addDays('2026-03-28', 1)).toBe('2026-03-29');
    expect(addDays('2026-03-29', 1)).toBe('2026-03-30');
    expect(addDays('2026-10-25', 1)).toBe('2026-10-26');
    expect(addDays('2026-10-26', -2)).toBe('2026-10-24');
  });

  it('keeps the week of the days around the change', () => {
    expect(isoWeekOf('2026-03-29')).toBe('2026-W13');
    expect(isoWeekOf('2026-03-30')).toBe('2026-W14');
    expect(sundayOf('2026-W43')).toBe('2026-10-25');
  });
});

describe('F2-01 date and week parsing', () => {
  it('accepts real calendar dates only', () => {
    expect(parseCalendarDate('2028-02-29')).toBe('2028-02-29');
    expect(parseCalendarDate('2026-02-29')).toBeUndefined();
    expect(parseCalendarDate('2026-13-01')).toBeUndefined();
    expect(parseCalendarDate('2026-1-01')).toBeUndefined();
  });

  it('accepts weeks that exist in their year only', () => {
    expect(parseIsoWeek('2026-W53')).toBe('2026-W53');
    expect(parseIsoWeek('2027-W53')).toBeUndefined();
    expect(parseIsoWeek('2026-W00')).toBeUndefined();
    expect(parseIsoWeek('2026-W5')).toBeUndefined();
  });
});
