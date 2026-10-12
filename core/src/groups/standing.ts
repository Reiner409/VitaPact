import { addDays, sundayOf, type CalendarDate } from '../calendar';
import { latestReport } from './members';
import type { RankedReport } from './ranking';

/** RF-14: a report counts as current for this many days after the Sunday that ends its week. */
const DAYS_BEFORE_WAITING = 8;

export type FriendStanding = { kind: 'reporting'; latest: RankedReport } | { kind: 'waiting' };

/** Calendar dates compare as text, so no clock or time zone is involved (G9.8). */
export function isWaiting(lastReportEnd: CalendarDate | undefined, today: CalendarDate): boolean {
  return lastReportEnd === undefined || today > addDays(lastReportEnd, DAYS_BEFORE_WAITING);
}

/** RF-14: a waiting friend shows no score, verdict or flag, so the standing carries none. */
export function friendStanding(
  reports: readonly RankedReport[],
  today: CalendarDate,
): FriendStanding {
  const latest = latestReport(reports);
  if (latest === undefined || isWaiting(sundayOf(latest.week), today)) return { kind: 'waiting' };
  return { kind: 'reporting', latest };
}
