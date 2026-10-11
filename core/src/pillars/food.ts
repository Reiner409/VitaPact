import type { Pillar } from './types';

/** A day of clean eating is rated 4 or 5 (section 9, `cleanOk`). */
const CLEAN_RATING = 4;

export const foodPillar: Pillar = {
  id: 'food',
  color: 'food',
  icon: 'food',
  fields: [{ kind: 'scale', key: 'rating', min: 1, max: 5 }],
  summaryField: 'rating',
  goal: {
    cadence: 'daily',
    default: CLEAN_RATING,
    min: CLEAN_RATING,
    max: CLEAN_RATING,
    step: 1,
    editable: false,
  },
  isOnGoal: (values, goal) => typeof values.rating === 'number' && values.rating >= goal,
};
