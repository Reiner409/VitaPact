import { MINUTES_IN_A_DAY } from './limits';
import type { Pillar } from './types';

export const WORKOUT_TYPES = [
  'gym',
  'running',
  'cycling',
  'swimming',
  'teamSports',
  'other',
] as const;

export const trainingPillar: Pillar = {
  id: 'training',
  color: 'training',
  icon: 'training',
  fields: [
    { kind: 'yesNo', key: 'trained' },
    {
      kind: 'choice',
      key: 'type',
      options: WORKOUT_TYPES,
      askedWhen: { key: 'trained', equals: true },
    },
    {
      kind: 'number',
      key: 'minutes',
      unit: 'minutes',
      min: 0,
      max: MINUTES_IN_A_DAY,
      step: 1,
      askedWhen: { key: 'trained', equals: true },
    },
  ],
  summaryField: 'minutes',
  goal: { cadence: 'weekly', default: 3, min: 1, max: 7, step: 1, editable: true },
  isOnGoal: (values) => values.trained === true,
};
