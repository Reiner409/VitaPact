import { describe, expect, it } from 'vitest';
import { canGoForward, nextWeek, weekRange } from './weekNavigation';

describe('RF-08 week selector navigation', () => {
  it('moves to the next week across the turn of a year with week 53', () => {
    expect(nextWeek('2026-W52')).toBe('2026-W53');
    expect(nextWeek('2026-W53')).toBe('2027-W01');
    expect(nextWeek('2027-W52')).toBe('2028-W01');
  });

  it('allows going forward only before the current week', () => {
    expect(canGoForward('2026-W40', '2026-W41')).toBe(true);
    expect(canGoForward('2026-W41', '2026-W41')).toBe(false);
    expect(canGoForward('2026-W53', '2027-W01')).toBe(true);
  });

  it('gives the week number and its Monday and Sunday', () => {
    expect(weekRange('2026-W53')).toEqual({ number: 53, from: '2026-12-28', to: '2027-01-03' });
  });
});
