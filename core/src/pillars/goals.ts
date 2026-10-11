import type { PillarValues } from './types';

/** An `isOnGoal` for pillars whose goal is a minimum value of one numeric field. */
export function reachesGoal(key: string) {
  return (values: PillarValues, goal: number): boolean => {
    const value = values[key];
    return typeof value === 'number' && value >= goal;
  };
}
