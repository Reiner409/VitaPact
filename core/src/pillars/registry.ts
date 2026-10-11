import { foodPillar } from './food';
import { sleepPillar } from './sleep';
import { sunPillar } from './sun';
import { trainingPillar } from './training';
import type { DayError, DayValues, Goals, Pillar } from './types';
import { validatePillarValues } from './validation';

export interface PillarRegistry {
  list(): readonly Pillar[];
  find(id: string): Pillar | undefined;
  defaultGoals(): Goals;
  validateDay(day: DayValues): DayError[];
}

export function createPillarRegistry(pillars: readonly Pillar[]): PillarRegistry {
  const byId = new Map(pillars.map((pillar) => [pillar.id, pillar]));
  if (byId.size !== pillars.length) throw new Error(`Duplicate pillar id in ${listIds(pillars)}`);
  return {
    list: () => pillars,
    find: (id) => byId.get(id),
    defaultGoals: () =>
      Object.fromEntries(pillars.map((pillar) => [pillar.id, pillar.goal.default])),
    validateDay: (day) => validateDay(byId, day),
  };
}

function listIds(pillars: readonly Pillar[]): string {
  return pillars.map((pillar) => pillar.id).join(', ');
}

function validateDay(byId: ReadonlyMap<string, Pillar>, day: DayValues): DayError[] {
  return Object.entries(day).flatMap(([id, values]): DayError[] => {
    const pillar = byId.get(id);
    if (!pillar) return [{ pillar: id, code: 'unknown-pillar' }];
    return values
      ? validatePillarValues(pillar, values).map((error) => ({ pillar: id, ...error }))
      : [];
  });
}

/** The pillars of VitaPact 1.0. A new pillar is one file and one line here (RF-23). */
export const pillarRegistry = createPillarRegistry([
  sleepPillar,
  trainingPillar,
  foodPillar,
  sunPillar,
]);
