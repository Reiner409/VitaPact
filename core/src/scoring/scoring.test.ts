import { sunPillar, trainingPillar } from '../pillars';
import type { DayValues, Goals } from '../pillars';
import { describe, expect, it } from 'vitest';
import { VERDICT_BANDS, dayScore, daysOnGoal, scoreWeights, verdictBand, weekScore } from './index';

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

function weekOf(count: number, day: DayValues): DayValues[] {
  return Array.from({ length: count }, () => day);
}

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
    expect(weekScore({ days: weekOf(7, perfectDay), goals, weighedIn: true })).toBe(100);
  });

  it('gives 0 to an empty week', () => {
    expect(weekScore({ days: [], goals, weighedIn: false })).toBe(0);
  });

  it('gives 5 to a week with only the weigh-in', () => {
    expect(weekScore({ days: [], goals, weighedIn: true })).toBe(5);
  });

  it('caps training at the weekly goal', () => {
    const days = [...weekOf(3, perfectDay), ...weekOf(4, restDay)];
    expect(weekScore({ days, goals, weighedIn: true })).toBe(100);
  });

  it('scores 62 for a solid week, as in the section 9 verdict table', () => {
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

  it('scores 34 for a light week, as in the section 9 comeback example', () => {
    const days = [
      dayMeeting('sleep', 'training', 'food', 'sun'),
      dayMeeting('sleep', 'food'),
      dayMeeting(),
    ];
    expect(weekScore({ days, goals, weighedIn: true })).toBe(34);
  });

  it('counts a missing pillar on a logged day as off goal', () => {
    const days = weekOf(7, { sleep: perfectDay.sleep });
    expect(weekScore({ days, goals, weighedIn: false })).toBe(40);
  });

  it('refuses more than 7 days', () => {
    expect(() => weekScore({ days: weekOf(8, perfectDay), goals, weighedIn: true })).toThrow(
      new RangeError('A week has at most 7 logged days, got 8'),
    );
  });

  it('follows the weights of the configuration file', () => {
    const weights = { ...scoreWeights, pillars: { ...scoreWeights.pillars, sun: 0 } };
    const days = weekOf(7, dayMeeting('sleep', 'training', 'food'));
    expect(weekScore({ days, goals, weighedIn: true })).toBe(90);
    expect(weekScore({ days, goals, weighedIn: true }, { weights })).toBe(100);
  });

  it('keeps the score within 0-100 when the weights do not add up to 100', () => {
    const weights = { logging: 1, weighIn: 1, pillars: { sleep: 2 } };
    const days = weekOf(7, perfectDay);
    expect(weekScore({ days, goals, weighedIn: true }, { weights })).toBe(100);
  });

  it('ignores goals and weights inherited from the object prototype', () => {
    const inheritedGoals = Object.create({ sun: 1000 }) as Goals;
    const inheritedWeights = { ...scoreWeights, pillars: Object.create({ sun: 1000 }) };
    const perfectWeek = weekOf(7, perfectDay);
    const weekWithoutSun = weekOf(7, dayMeeting('sleep', 'training', 'food'));
    expect(weekScore({ days: perfectWeek, goals: inheritedGoals, weighedIn: true })).toBe(100);
    expect(
      weekScore({ days: weekWithoutSun, goals, weighedIn: true }, { weights: inheritedWeights }),
    ).toBe(100);
  });

  it('follows alternative weights from a test configuration', () => {
    const weights = { logging: 0, weighIn: 50, pillars: { sleep: 50 } };
    const days = weekOf(7, dayMeeting('sleep'));
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

describe('RF-09 days on goal', () => {
  it('counts every workout, even beyond the weekly goal', () => {
    const days = [...weekOf(4, perfectDay), ...weekOf(3, restDay)];
    expect(daysOnGoal(trainingPillar, days, goals)).toBe(4);
  });

  it('counts only the days that reach a daily goal', () => {
    const days = [dayMeeting('sun'), dayMeeting('sun'), dayMeeting(), {}];
    expect(daysOnGoal(sunPillar, days, goals)).toBe(2);
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
    expect(dayScore(missedDay, goals)).toBe(21);
  });

  it('uses the weekly weights without the weigh-in', () => {
    expect(dayScore(dayMeeting('sleep', 'training'), goals)).toBe(68);
  });

  it('follows alternative weights', () => {
    const weights = { logging: 0, weighIn: 0, pillars: { sleep: 1, sun: 1 } };
    expect(dayScore(dayMeeting('sleep'), goals, { weights })).toBe(50);
  });
});

describe('RF-09 verdict bands (section 9)', () => {
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
