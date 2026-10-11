import type { DayValues, Goals } from '../pillars';
import { describe, expect, it } from 'vitest';
import { VERDICT_BANDS, dayScore, scoreWeights, verdictBand, weekScore } from './index';

const goals: Goals = { sleep: 7.5, training: 3, food: 4, sun: 20 };

const perfectDay: DayValues = {
  sleep: { hours: 8, quality: 4 },
  training: { trained: true, type: 'gym', minutes: 45 },
  food: { rating: 5 },
  sun: { minutes: 30 },
};
const restDay: DayValues = { ...perfectDay, training: { trained: false } };
const missedDay: DayValues = {
  sleep: { hours: 5, quality: 2 },
  training: { trained: false },
  food: { rating: 2 },
  sun: { minutes: 0 },
};

/** A logged day that meets only the goals listed. */
function dayMeeting(...pillars: string[]): DayValues {
  return Object.fromEntries(
    Object.entries(missedDay).map(([id, values]) => [
      id,
      pillars.includes(id) ? perfectDay[id] : values,
    ]),
  );
}

describe('RF-09 D8 weekly score', () => {
  it('gives 100 to a perfect week with the weigh-in', () => {
    expect(weekScore({ days: Array(7).fill(perfectDay), goals, weighedIn: true })).toBe(100);
  });

  it('gives 0 to an empty week', () => {
    expect(weekScore({ days: [], goals, weighedIn: false })).toBe(0);
  });

  it('gives 5 to a week with only the weigh-in', () => {
    expect(weekScore({ days: [], goals, weighedIn: true })).toBe(5);
  });

  it('caps training at the weekly goal', () => {
    const days = [...Array(3).fill(perfectDay), ...Array(4).fill(restDay)];
    expect(weekScore({ days, goals, weighedIn: true })).toBe(100);
  });

  it('scores 62 for the section 9 example of a solid week', () => {
    const days = [
      dayMeeting('sleep', 'training', 'food', 'sun'),
      dayMeeting('sleep', 'training', 'food', 'sun'),
      dayMeeting('sleep', 'food', 'sun'),
      dayMeeting('sleep'),
      dayMeeting(),
      dayMeeting(),
    ];
    expect(weekScore({ days, goals, weighedIn: true })).toBe(62);
  });

  it('scores 34 for the section 9 example of the week before', () => {
    const days = [
      dayMeeting('sleep', 'training', 'food', 'sun'),
      dayMeeting('sleep', 'food'),
      dayMeeting(),
    ];
    expect(weekScore({ days, goals, weighedIn: true })).toBe(34);
  });

  it('counts a missing pillar on a logged day as off goal', () => {
    const days = Array(7).fill({ sleep: perfectDay.sleep });
    expect(weekScore({ days, goals, weighedIn: false })).toBe(40);
  });

  it('refuses more than 7 days', () => {
    expect(() => weekScore({ days: Array(8).fill(perfectDay), goals, weighedIn: true })).toThrow();
  });

  it('follows the weights of the configuration file', () => {
    const weights = { ...scoreWeights, pillars: { ...scoreWeights.pillars, sun: 0 } };
    const days = Array(7).fill(dayMeeting('sleep', 'training', 'food'));
    expect(weekScore({ days, goals, weighedIn: true })).toBe(90);
    expect(weekScore({ days, goals, weighedIn: true }, { weights })).toBe(100);
  });

  it('keeps the score within 0-100 when the weights do not add up to 100', () => {
    const weights = { logging: 1, weighIn: 1, pillars: { sleep: 2 } };
    const days = Array(7).fill(perfectDay);
    expect(weekScore({ days, goals, weighedIn: true }, { weights })).toBe(100);
  });

  it('follows alternative weights from a test configuration', () => {
    const weights = { logging: 0, weighIn: 50, pillars: { sleep: 50 } };
    const days = Array(7).fill(dayMeeting('sleep'));
    expect(weekScore({ days, goals, weighedIn: false }, { weights })).toBe(50);
    expect(weekScore({ days: [], goals, weighedIn: true }, { weights })).toBe(50);
  });

  it('uses the D8 weights 15/25/25/20/10/5', () => {
    expect(scoreWeights).toEqual({
      logging: 15,
      weighIn: 5,
      pillars: { sleep: 25, training: 25, food: 20, sun: 10 },
    });
  });
});

describe('RF-09 daily score (section 5.3)', () => {
  it('gives 100 to a day on every goal', () => {
    expect(dayScore(perfectDay, goals)).toBe(100);
  });

  it('does not lower the score on a rest day with training "no"', () => {
    expect(dayScore(restDay, goals)).toBe(100);
  });

  it('counts only logging on a day off every goal', () => {
    expect(dayScore(missedDay, goals)).toBe(Math.round((15 / 70) * 100));
  });

  it('uses the weekly weights without the weigh-in', () => {
    expect(dayScore(dayMeeting('sleep', 'training'), goals)).toBe(Math.round((65 / 95) * 100));
  });

  it('follows alternative weights', () => {
    const weights = { logging: 0, weighIn: 0, pillars: { sleep: 1, sun: 1 } };
    expect(dayScore(dayMeeting('sleep'), goals, { weights })).toBe(50);
  });
});

describe('RF-09 RF-15 verdict bands (section 9)', () => {
  it.each([
    [0, 'pauseWeek'],
    [29, 'pauseWeek'],
    [30, 'lightWeek'],
    [49, 'lightWeek'],
    [50, 'solidBase'],
    [69, 'solidBase'],
    [70, 'onIt'],
    [84, 'onIt'],
    [85, 'greatShape'],
    [100, 'greatShape'],
  ])('puts %i in the %s band', (score, band) => {
    expect(verdictBand(score)).toBe(band);
  });

  it('lists the five bands from the lowest', () => {
    expect(VERDICT_BANDS).toEqual(['pauseWeek', 'lightWeek', 'solidBase', 'onIt', 'greatShape']);
  });
});
