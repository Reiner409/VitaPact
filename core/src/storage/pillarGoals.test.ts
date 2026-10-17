import { describe, expect, it } from 'vitest';
import { pillarGoalsOf } from './pillarGoals';
import { DEFAULT_GOALS } from './profile';

describe('F3-TD-05 goals of the pillar cards', () => {
  it('RF-03 reads the sleep, training and sun goals from the profile', () => {
    expect(pillarGoalsOf({ sleepHours: 8, workoutsPerWeek: 4, sunMinutes: 30 })).toEqual({
      sleep: 8,
      training: 4,
      food: 4,
      sun: 30,
    });
  });

  it('uses the default goals when there is no profile yet', () => {
    expect(pillarGoalsOf(DEFAULT_GOALS)).toEqual({ sleep: 7.5, training: 3, food: 4, sun: 20 });
  });
});
