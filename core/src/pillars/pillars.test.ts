import { describe, expect, it } from 'vitest';
import {
  WORKOUT_TYPES,
  createPillarRegistry,
  foodPillar,
  pillarRegistry,
  sleepPillar,
  sunPillar,
  trainingPillar,
  validatePillarValues,
} from './index';
import { hydrationPillar } from './testing/hydrationPillar';

const errorCodes = (...args: Parameters<typeof validatePillarValues>) =>
  validatePillarValues(...args).map((error) => `${error.field}:${error.code}`);

describe('RF-03 sleep pillar', () => {
  it('accepts hours in steps of 0.5 and a quality from 1 to 5', () => {
    expect(validatePillarValues(sleepPillar, { hours: 7.5, quality: 4 })).toEqual([]);
  });

  it.each([7.3, 8.25])('rejects %s hours, which is not a step of 0.5', (hours) => {
    expect(errorCodes(sleepPillar, { hours, quality: 3 })).toEqual(['hours:step']);
  });

  it.each([-0.5, 24.5])('rejects %s hours, outside 0 to 24', (hours) => {
    expect(errorCodes(sleepPillar, { hours, quality: 3 })).toEqual(['hours:range']);
  });

  it.each([0, 6])('rejects quality %s, outside 1 to 5', (quality) => {
    expect(errorCodes(sleepPillar, { hours: 7, quality })).toEqual(['quality:range']);
  });

  it('rejects a quality that is not a whole number', () => {
    expect(errorCodes(sleepPillar, { hours: 7, quality: 2.5 })).toEqual(['quality:step']);
  });

  it('asks for every field', () => {
    expect(errorCodes(sleepPillar, {})).toEqual(['hours:required', 'quality:required']);
  });

  it('is on goal when the hours reach the goal', () => {
    expect(sleepPillar.isOnGoal({ hours: 7.5, quality: 1 }, 7.5)).toBe(true);
    expect(sleepPillar.isOnGoal({ hours: 7, quality: 5 }, 7.5)).toBe(false);
  });
});

describe('RF-03 training pillar', () => {
  it('lists the 6 workout types', () => {
    expect(WORKOUT_TYPES).toEqual(['gym', 'running', 'cycling', 'swimming', 'teamSports', 'other']);
  });

  it.each(WORKOUT_TYPES)('accepts a %s workout with its minutes', (type) => {
    expect(validatePillarValues(trainingPillar, { trained: true, type, minutes: 45 })).toEqual([]);
  });

  it('rejects a workout type outside the 6', () => {
    expect(errorCodes(trainingPillar, { trained: true, type: 'yoga', minutes: 30 })).toEqual([
      'type:option',
    ]);
  });

  it('accepts 0 minutes and rejects negative or fractional minutes', () => {
    expect(errorCodes(trainingPillar, { trained: true, type: 'gym', minutes: 0 })).toEqual([]);
    expect(errorCodes(trainingPillar, { trained: true, type: 'gym', minutes: -5 })).toEqual([
      'minutes:range',
    ]);
    expect(errorCodes(trainingPillar, { trained: true, type: 'gym', minutes: 2.5 })).toEqual([
      'minutes:step',
    ]);
  });

  it('asks for type and minutes only when the user trained', () => {
    expect(validatePillarValues(trainingPillar, { trained: false })).toEqual([]);
    expect(errorCodes(trainingPillar, { trained: true })).toEqual([
      'type:required',
      'minutes:required',
    ]);
  });

  it('rejects a yes/no answer that is not a boolean', () => {
    expect(errorCodes(trainingPillar, { trained: 'yes' })).toEqual(['trained:type']);
  });

  it('counts a day with a workout towards the weekly goal', () => {
    expect(trainingPillar.goal.cadence).toBe('weekly');
    expect(trainingPillar.isOnGoal({ trained: true, type: 'gym', minutes: 30 }, 3)).toBe(true);
    expect(trainingPillar.isOnGoal({ trained: false }, 3)).toBe(false);
  });
});

describe('RF-03 D6 eating pillar', () => {
  it.each([1, 2, 3, 4, 5])('accepts a rating of %s', (rating) => {
    expect(validatePillarValues(foodPillar, { rating })).toEqual([]);
  });

  it.each([0, 6, 3.5, '4'])('rejects a rating of %s', (rating) => {
    expect(errorCodes(foodPillar, { rating })).toHaveLength(1);
  });

  it('is on goal with a rating of 4 or 5 (section 9, cleanOk)', () => {
    expect(foodPillar.isOnGoal({ rating: 4 }, foodPillar.goal.default)).toBe(true);
    expect(foodPillar.isOnGoal({ rating: 3 }, foodPillar.goal.default)).toBe(false);
  });
});

describe('RF-03 sun pillar', () => {
  it('accepts 0 or more whole minutes', () => {
    expect(validatePillarValues(sunPillar, { minutes: 0 })).toEqual([]);
    expect(errorCodes(sunPillar, { minutes: -1 })).toEqual(['minutes:range']);
    expect(errorCodes(sunPillar, { minutes: Number.NaN })).toEqual(['minutes:type']);
  });

  it('is on goal when the minutes reach the goal', () => {
    expect(sunPillar.isOnGoal({ minutes: 20 }, 20)).toBe(true);
    expect(sunPillar.isOnGoal({ minutes: 19 }, 20)).toBe(false);
  });
});

describe('RF-01 RF-03 default goals', () => {
  it('match the first-launch defaults', () => {
    expect(pillarRegistry.defaultGoals()).toEqual({ sleep: 7.5, training: 3, food: 4, sun: 20 });
  });
});

describe('RF-23 pillar registry', () => {
  it('lists sleep, training, eating and sun in order', () => {
    expect(pillarRegistry.list().map((pillar) => pillar.id)).toEqual([
      'sleep',
      'training',
      'food',
      'sun',
    ]);
  });

  it('gives each pillar the colour and icon of the same name in the design system', () => {
    for (const pillar of pillarRegistry.list()) {
      expect(pillar.color).toBe(pillar.id);
      expect(pillar.icon).toBe(pillar.id);
    }
  });

  it('finds a pillar by id and nothing for an unknown id', () => {
    expect(pillarRegistry.find('sun')).toBe(sunPillar);
    expect(pillarRegistry.find('steps')).toBeUndefined();
  });

  it('D7 takes a new pillar from a single file and one line', () => {
    const registry = createPillarRegistry([
      sleepPillar,
      trainingPillar,
      foodPillar,
      sunPillar,
      hydrationPillar,
    ]);

    expect(registry.find('hydration')).toBe(hydrationPillar);
    expect(registry.list().at(-1)).toBe(hydrationPillar);
    expect(registry.defaultGoals()).toMatchObject({ hydration: 2 });
  });

  it('refuses two pillars with the same id', () => {
    expect(() => createPillarRegistry([sunPillar, sunPillar])).toThrow(/sun/);
  });

  it('validates a whole day and reports errors per pillar', () => {
    const errors = pillarRegistry.validateDay({
      sleep: { hours: 7, quality: 4 },
      sun: { minutes: -3 },
    });

    expect(errors).toEqual([{ pillar: 'sun', field: 'minutes', code: 'range' }]);
  });

  it('rejects a day with an unknown pillar', () => {
    expect(pillarRegistry.validateDay({ steps: { count: 8000 } })).toEqual([
      { pillar: 'steps', code: 'unknown-pillar' },
    ]);
  });
});
