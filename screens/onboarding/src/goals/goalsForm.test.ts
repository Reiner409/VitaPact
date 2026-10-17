import { DEFAULT_GOALS } from '@vitapact/core/storage';
import { describe, expect, it } from 'vitest';
import { GOAL_RULES, defaultGoalsForm, goalsOf, invalidGoals } from './goalsForm';

describe('RF-01 welcome step 2: goal values', () => {
  it('starts from the default goals', () => {
    expect(defaultGoalsForm()).toEqual(DEFAULT_GOALS);
    expect(goalsOf(defaultGoalsForm())).toEqual(DEFAULT_GOALS);
  });

  it('flags an empty goal, one out of range and one off the step', () => {
    const { max } = GOAL_RULES.sunMinutes;
    const form = { sleepHours: null, workoutsPerWeek: 2.5, sunMinutes: max + 5 };
    expect(invalidGoals(form)).toEqual(['sleepHours', 'workoutsPerWeek', 'sunMinutes']);
    expect(goalsOf(form)).toBeUndefined();
  });
});
