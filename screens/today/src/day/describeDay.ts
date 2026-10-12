import { daysToSunday, isoWeekOf, type CalendarDate } from '@vitapact/core/calendar';

export interface DayDescription {
  date: CalendarDate;
  /** The number of the ISO week, e.g. 42 for `2026-W42`. */
  weekNumber: number;
  /** Zero on Sunday, the day of the weigh-in. */
  daysToSunday: number;
}

export function describeDay(date: CalendarDate): DayDescription {
  return {
    date,
    weekNumber: Number(isoWeekOf(date).slice(-2)),
    daysToSunday: daysToSunday(date),
  };
}
