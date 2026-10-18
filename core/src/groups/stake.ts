import { daysBetween, mondayOf, type IsoWeek } from '../calendar';

/** A Monday every week index counts from; any Monday works, it only has to stay the same. */
const FIRST_MONDAY = '2024-01-01';

/**
 * RF-25: the stake of the week for a group whose stake rotates, 0-based in the list of stakes.
 * It depends on the week alone, so every phone shows the same stake with nothing to sync, and
 * two weeks in a row never share one.
 */
export function weeklyStakeIndex(week: IsoWeek, count: number): number {
  if (count < 1) throw new RangeError('There must be at least one stake');
  const weeks = daysBetween(FIRST_MONDAY, mondayOf(week)) / 7;
  return ((weeks % count) + count) % count;
}
