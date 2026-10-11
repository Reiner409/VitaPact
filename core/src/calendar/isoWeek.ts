import {
  addDays,
  daysBetween,
  formatDate,
  isoWeekday,
  pad,
  type CalendarDate,
} from './calendarDate';

/** An ISO 8601 week, Monday to Sunday, as `YYYY-Www` (e.g. `2026-W41`). */
export type IsoWeek = string;

const ISO_WEEK = /^(\d{4})-W(\d{2})$/;

/** The Thursday of a week decides which year the week belongs to (ISO 8601). */
function thursdayOf(day: CalendarDate): CalendarDate {
  return addDays(day, 4 - isoWeekday(day));
}

function formatWeek(year: number, week: number): IsoWeek {
  return `${pad(year, 4)}-W${pad(week, 2)}`;
}

export function isoWeekOf(day: CalendarDate): IsoWeek {
  const thursday = thursdayOf(day);
  const year = Number(thursday.slice(0, 4));
  const firstThursday = thursdayOf(formatDate(year, 1, 4));
  return formatWeek(year, daysBetween(firstThursday, thursday) / 7 + 1);
}

function weekParts(week: IsoWeek): { year: number; number: number } {
  const match = ISO_WEEK.exec(week);
  if (!match) throw new RangeError(`Not an ISO week: ${week}`);
  return { year: Number(match[1]), number: Number(match[2]) };
}

export function mondayOf(week: IsoWeek): CalendarDate {
  const { year, number } = weekParts(week);
  const january4 = formatDate(year, 1, 4);
  const firstMonday = addDays(january4, 1 - isoWeekday(january4));
  return addDays(firstMonday, (number - 1) * 7);
}

export function sundayOf(week: IsoWeek): CalendarDate {
  return addDays(mondayOf(week), 6);
}

export function previousWeek(week: IsoWeek): IsoWeek {
  return isoWeekOf(addDays(mondayOf(week), -7));
}

/** D30: a week belongs to the month of its Sunday, as `YYYY-MM`. */
export function monthOfWeek(week: IsoWeek): string {
  return sundayOf(week).slice(0, 7);
}

/** RF-07, D26: a week's weigh-in can be caught up until the Tuesday after its Sunday. */
export function weighInCatchUpDeadline(week: IsoWeek): CalendarDate {
  return addDays(sundayOf(week), 2);
}

export function parseIsoWeek(text: string): IsoWeek | undefined {
  // Week 00 or a week 53 the year does not have lands in another week once normalised.
  return ISO_WEEK.test(text) && isoWeekOf(mondayOf(text)) === text ? text : undefined;
}
