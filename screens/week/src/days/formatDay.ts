import type { CalendarDate } from '@vitapact/core/calendar';

type DayStyle = 'short' | 'long' | 'weekday';

const options: Record<DayStyle, Intl.DateTimeFormatOptions> = {
  short: { day: 'numeric', month: 'short' },
  long: { weekday: 'long', day: 'numeric', month: 'long' },
  weekday: { weekday: 'short' },
};

/** Calendar days are UTC midnights in core (G9.8), so they are formatted in UTC too. */
export function formatDay(date: CalendarDate, language: string, style: DayStyle): string {
  return new Intl.DateTimeFormat(language, { ...options[style], timeZone: 'UTC' }).format(
    new Date(`${date}T00:00:00Z`),
  );
}
