import { reachesGoal } from './goals';
import type { Pillar } from './types';

export const sleepPillar: Pillar = {
  id: 'sleep',
  color: 'sleep',
  icon: 'sleep',
  fields: [
    { kind: 'number', key: 'hours', unit: 'hours', min: 0, max: 24, step: 0.5 },
    { kind: 'scale', key: 'quality', min: 1, max: 5 },
  ],
  summaryField: 'hours',
  goal: { cadence: 'daily', default: 7.5, min: 4, max: 12, step: 0.5, editable: true },
  isOnGoal: reachesGoal('hours'),
};
