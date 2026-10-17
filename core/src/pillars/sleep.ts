import { ratingShare, reachesGoal, shareOf } from './goals';
import type { Pillar } from './types';

/** In the day score, sleep counts its hours more than how it felt. */
const HOURS_SHARE = 0.7;
const QUALITY_SHARE = 0.3;

export const sleepPillar: Pillar = {
  id: 'sleep',
  color: 'sleep',
  icon: 'sleep',
  fields: [
    { kind: 'number', key: 'hours', unit: 'hours', min: 0, max: 24, step: 0.5 },
    // With no sleep there is no quality to rate.
    { kind: 'scale', key: 'quality', min: 1, max: 5, askedWhen: { key: 'hours', above: 0 } },
  ],
  summaryField: 'hours',
  goal: { cadence: 'daily', default: 7.5, min: 4, max: 12, step: 0.5, editable: true },
  isOnGoal: reachesGoal('hours'),
  dayProgress: (values, goal) => {
    const slept = typeof values.hours === 'number' && values.hours > 0;
    if (!slept) return 0;
    return HOURS_SHARE * shareOf(values.hours, goal) + QUALITY_SHARE * ratingShare(values.quality);
  },
};
