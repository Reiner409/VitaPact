import { foodPillar, type Goals as PillarGoals } from '../pillars';
import type { Goals as ProfileGoals } from './records';

/** The profile keeps goals by name; the pillar modules read them by pillar id. */
export function pillarGoalsOf(goals: ProfileGoals): PillarGoals {
  return {
    sleep: goals.sleepHours,
    training: goals.workoutsPerWeek,
    // Clean eating has no user goal: a clean day is a fixed rating (section 9).
    food: foodPillar.goal.default,
    sun: goals.sunMinutes,
  };
}
