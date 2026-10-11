import { MINUTES_IN_A_DAY } from './limits';
import { reachesGoal } from './goals';
import type { Pillar } from './types';

export const sunPillar: Pillar = {
  id: 'sun',
  color: 'sun',
  icon: 'sun',
  fields: [
    { kind: 'number', key: 'minutes', unit: 'minutes', min: 0, max: MINUTES_IN_A_DAY, step: 1 },
  ],
  summaryField: 'minutes',
  goal: { cadence: 'daily', default: 20, min: 5, max: 240, step: 5, editable: true },
  isOnGoal: reachesGoal('minutes'),
};
