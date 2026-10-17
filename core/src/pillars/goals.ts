import type { PillarValues } from './types';

/** An `isOnGoal` for pillars whose goal is a minimum value of one numeric field. */
export function reachesGoal(key: string) {
  return (values: PillarValues, goal: number): boolean => {
    const value = values[key];
    return typeof value === 'number' && value >= goal;
  };
}

/** A share of a numeric target, capped at 1; a missing answer is 0. */
export function shareOf(value: unknown, target: number): number {
  if (typeof value !== 'number' || target <= 0) return 0;
  return Math.min(1, Math.max(0, value / target));
}

/** Where a 1-5 rating sits between its lowest (0) and highest (1) step. */
export function ratingShare(value: unknown, min = 1, max = 5): number {
  if (typeof value !== 'number') return 0;
  return Math.min(1, Math.max(0, (value - min) / (max - min)));
}
