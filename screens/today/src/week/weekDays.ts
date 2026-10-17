import { addDays, isoWeekOf, mondayOf, type CalendarDate } from '@vitapact/core/calendar';
import type { Goals } from '@vitapact/core/pillars';
import { dayScore } from '@vitapact/core/scoring';
import type { DailyEntry } from '@vitapact/core/storage';
import { dayValuesOf } from '../day/dayValues';

export interface WeekDay {
  date: CalendarDate;
  /** `null` when the day was not logged. */
  score: number | null;
}

/** Monday to Sunday of the week holding `day`. */
export function weekDatesOf(day: CalendarDate): CalendarDate[] {
  const monday = mondayOf(isoWeekOf(day));
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

/** Each day of the week with the score of its saved entry (section 5.2 strip). */
export function weekDaysOf(
  day: CalendarDate,
  entries: readonly DailyEntry[],
  goals: Goals,
): WeekDay[] {
  const byDate = new Map(entries.map((entry) => [entry.date, entry]));
  return weekDatesOf(day).map((date) => {
    const entry = byDate.get(date);
    return { date, score: entry ? dayScore(dayValuesOf(entry), goals) : null };
  });
}
