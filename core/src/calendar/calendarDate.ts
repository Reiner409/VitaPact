/** A local calendar day as `YYYY-MM-DD`, the key of daily entries (section 8). */
export type CalendarDate = string;

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const CALENDAR_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

const pad = (value: number, width: number) => String(value).padStart(width, '0');

/**
 * Day arithmetic runs on UTC midnights: a UTC day always lasts 24 hours, so daylight saving
 * changes in the user's zone never shift a date.
 */
export function toUtcMidnight(day: CalendarDate): Date {
  return new Date(`${day}T00:00:00Z`);
}

export function fromUtcMidnight(moment: Date): CalendarDate {
  return formatDate(moment.getUTCFullYear(), moment.getUTCMonth() + 1, moment.getUTCDate());
}

export function formatDate(year: number, month: number, dayOfMonth: number): CalendarDate {
  return `${pad(year, 4)}-${pad(month, 2)}-${pad(dayOfMonth, 2)}`;
}

/** The day a moment falls on in the user's own time zone. */
export function toCalendarDate(moment: Date): CalendarDate {
  return formatDate(moment.getFullYear(), moment.getMonth() + 1, moment.getDate());
}

export function parseCalendarDate(text: string): CalendarDate | undefined {
  if (!CALENDAR_DATE.test(text)) return undefined;
  const moment = toUtcMidnight(text);
  return !Number.isNaN(moment.getTime()) && fromUtcMidnight(moment) === text ? text : undefined;
}

export function daysBetween(from: CalendarDate, to: CalendarDate): number {
  return Math.round((toUtcMidnight(to).getTime() - toUtcMidnight(from).getTime()) / MS_PER_DAY);
}

export function addDays(day: CalendarDate, days: number): CalendarDate {
  return fromUtcMidnight(new Date(toUtcMidnight(day).getTime() + days * MS_PER_DAY));
}

/** ISO weekday: Monday is 1, Sunday is 7. */
export function isoWeekday(day: CalendarDate): number {
  return toUtcMidnight(day).getUTCDay() || 7;
}

export function isSunday(day: CalendarDate): boolean {
  return isoWeekday(day) === 7;
}

export function daysToSunday(day: CalendarDate): number {
  return 7 - isoWeekday(day);
}
