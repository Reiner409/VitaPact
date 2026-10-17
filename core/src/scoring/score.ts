import { pillarRegistry } from '../pillars';
import type { DayValues, Goals, Pillar, PillarRegistry } from '../pillars';
import { scoreWeights } from './weights';
import type { ScoreWeights } from './weights';

const DAYS_IN_A_WEEK = 7;

export interface WeekScoreInput {
  /** The logged days of the week, at most 7; a day that was not logged is left out. */
  readonly days: readonly DayValues[];
  readonly goals: Goals;
  readonly weighedIn: boolean;
}

export interface ScoreOptions {
  readonly weights?: ScoreWeights;
  readonly pillars?: PillarRegistry;
}

/** A weighted part of the score: `progress` from 0 to 1, or null when it does not count. */
interface ScorePart {
  readonly weight: number;
  readonly progress: number | null;
}

export function weekScore(input: WeekScoreInput, options: ScoreOptions = {}): number {
  if (input.days.length > DAYS_IN_A_WEEK) {
    throw new RangeError(`A week has at most 7 logged days, got ${input.days.length}`);
  }
  const { weights = scoreWeights, pillars = pillarRegistry } = options;
  return toScore([
    { weight: weights.logging, progress: input.days.length / DAYS_IN_A_WEEK },
    { weight: weights.weighIn, progress: input.weighedIn ? 1 : 0 },
    ...pillars.list().map((pillar) => ({
      weight: ownValue(weights.pillars, pillar.id) ?? 0,
      progress: pillarWeekProgress(pillar, input),
    })),
  ]);
}

/**
 * Section 5.3: the pillar weights of the week, each pillar earning the share of its goal it
 * reached, so a day with nothing done scores 0. A rest day does not lower the score.
 */
export function dayScore(day: DayValues, goals: Goals, options: ScoreOptions = {}): number {
  const { weights = scoreWeights, pillars = pillarRegistry } = options;
  return toScore([
    ...pillars.list().map((pillar) => ({
      weight: ownValue(weights.pillars, pillar.id) ?? 0,
      progress: pillarDayProgress(pillar, day, goals),
    })),
  ]);
}

/** How many of the given days meet the pillar's goal. */
export function daysOnGoal(pillar: Pillar, days: readonly DayValues[], goals: Goals): number {
  return days.filter((day) => isDayOnGoal(pillar, day, goals)).length;
}

function pillarWeekProgress(pillar: Pillar, { days, goals }: WeekScoreInput): number {
  const onGoal = daysOnGoal(pillar, days, goals);
  if (pillar.goal.cadence === 'daily') return onGoal / DAYS_IN_A_WEEK;
  const weeklyGoal = goalOf(pillar, goals);
  return weeklyGoal > 0 ? Math.min(1, onGoal / weeklyGoal) : 1;
}

function pillarDayProgress(pillar: Pillar, day: DayValues, goals: Goals): number | null {
  const onGoal = isDayOnGoal(pillar, day, goals);
  if (pillar.goal.cadence === 'weekly') return onGoal ? 1 : null;
  const values = day[pillar.id];
  if (values === undefined || !pillar.dayProgress) return onGoal ? 1 : 0;
  return pillar.dayProgress(values, goalOf(pillar, goals));
}

function isDayOnGoal(pillar: Pillar, day: DayValues, goals: Goals): boolean {
  const values = day[pillar.id];
  return values !== undefined && pillar.isOnGoal(values, goalOf(pillar, goals));
}

function goalOf(pillar: Pillar, goals: Goals): number {
  return ownValue(goals, pillar.id) ?? pillar.goal.default;
}

/** Goals come from storage, so a key such as `constructor` must not reach the prototype. */
function ownValue(record: Readonly<Record<string, number>>, key: string): number | undefined {
  return Object.hasOwn(record, key) ? record[key] : undefined;
}

function toScore(parts: readonly ScorePart[]): number {
  const counted = parts.filter((part) => part.progress !== null && part.weight > 0);
  const total = counted.reduce((sum, part) => sum + part.weight, 0);
  if (total === 0) return 0;
  const earned = counted.reduce((sum, part) => sum + part.weight * (part.progress ?? 0), 0);
  return Math.round((earned / total) * 100);
}
