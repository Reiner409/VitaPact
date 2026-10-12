import { addDays, isoWeekOf, mondayOf, sundayOf } from '@vitapact/core/calendar';
import type { CalendarDate, IsoWeek } from '@vitapact/core/calendar';

export interface WeekRange {
  readonly number: number;
  readonly from: CalendarDate;
  readonly to: CalendarDate;
}

export function nextWeek(week: IsoWeek): IsoWeek {
  return isoWeekOf(addDays(mondayOf(week), 7));
}

/** RF-08: the future has nothing to show, so the selector stops at the current week. */
export function canGoForward(shown: IsoWeek, current: IsoWeek): boolean {
  return mondayOf(shown) < mondayOf(current);
}

export function weekRange(week: IsoWeek): WeekRange {
  return { number: Number(week.slice(-2)), from: mondayOf(week), to: sundayOf(week) };
}

/** Dates are formatted in UTC, so the shown day never shifts with the time zone (G9.8). */
export function atUtcMidnight(day: CalendarDate): Date {
  return new Date(`${day}T00:00:00.000Z`);
}
