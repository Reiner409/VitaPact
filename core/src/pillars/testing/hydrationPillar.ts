import type { Pillar } from '../types';

/** A pillar that only exists in tests, to prove a new one needs a single file (RF-23, D7). */
export const hydrationPillar: Pillar = {
  id: 'hydration',
  color: 'hydration',
  icon: 'hydration',
  fields: [{ kind: 'number', key: 'litres', unit: 'litres', min: 0, max: 10, step: 0.25 }],
  summaryField: 'litres',
  goal: { cadence: 'daily', default: 2, min: 0.5, max: 5, step: 0.25, editable: true },
  isOnGoal: (values, goal) => typeof values.litres === 'number' && values.litres >= goal,
};
