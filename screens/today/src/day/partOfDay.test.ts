import { describe, expect, it } from 'vitest';
import { partOfDay } from './partOfDay';

const at = (hour: number) => new Date(2026, 9, 17, hour, 30);

describe('F3-TD-01 greeting by the hour', () => {
  it.each([
    [4, 'night'],
    [5, 'morning'],
    [11, 'morning'],
    [12, 'afternoon'],
    [17, 'afternoon'],
    [18, 'evening'],
    [22, 'evening'],
    [23, 'night'],
    [0, 'night'],
  ])('at %i:30 it is %s', (hour, part) => {
    expect(partOfDay(at(hour))).toBe(part);
  });
});
