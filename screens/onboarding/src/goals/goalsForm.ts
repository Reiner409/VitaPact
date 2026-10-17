import { sleepPillar, sunPillar, trainingPillar, type PillarGoal } from '@vitapact/core/pillars';
import { DEFAULT_GOALS, type Goals } from '@vitapact/core/storage';

export type GoalKey = keyof Goals;

/** The goals as typed; `null` is an emptied number field. */
export type GoalsForm = Record<GoalKey, number | null>;

/** Each goal takes its range and step from the pillar it measures. */
export const GOAL_RULES: Readonly<Record<GoalKey, PillarGoal>> = {
  sleepHours: sleepPillar.goal,
  workoutsPerWeek: trainingPillar.goal,
  sunMinutes: sunPillar.goal,
};

export const GOAL_KEYS = Object.keys(GOAL_RULES) as GoalKey[];

export const defaultGoalsForm = (): GoalsForm => ({ ...DEFAULT_GOALS });

function isGoalValid(key: GoalKey, value: number | null): value is number {
  const { min, max, step } = GOAL_RULES[key];
  if (value === null || !Number.isFinite(value) || value < min || value > max) return false;
  const steps = (value - min) / step;
  return Math.abs(steps - Math.round(steps)) < 1e-9;
}

/** The goals whose value is empty, out of range or off the pillar's step. */
export const invalidGoals = (form: GoalsForm): GoalKey[] =>
  GOAL_KEYS.filter((key) => !isGoalValid(key, form[key]));

/** The goals ready to store, or `undefined` while one is invalid. */
export function goalsOf(form: GoalsForm): Goals | undefined {
  const { sleepHours, workoutsPerWeek, sunMinutes } = form;
  if (invalidGoals(form).length > 0) return undefined;
  if (sleepHours === null || workoutsPerWeek === null || sunMinutes === null) return undefined;
  return { sleepHours, workoutsPerWeek, sunMinutes };
}
