import type { CalendarDate } from '@vitapact/core/calendar';
import { useTranslation } from '@vitapact/i18n';
import { PageHeader } from '@vitapact/ui';
import { describeDay } from './describeDay';
import { partOfDay } from './partOfDay';

/** Calendar days are UTC midnights in core (G9.8), so the date is formatted in UTC too. */
function formatDay(date: CalendarDate, language: string): string {
  return new Intl.DateTimeFormat(language, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}

export interface DayHeaderProps {
  date: CalendarDate;
  /** The user's nickname; no greeting before the profile exists. */
  nickname?: string | undefined;
  now: Date;
}

/** A greeting by the hour, the date, the ISO week and the days left to the Sunday weigh-in (section 5.2). */
export function DayHeader({ date, nickname, now }: DayHeaderProps) {
  const { t, i18n } = useTranslation('today');
  const day = describeDay(date);
  const countdown =
    day.daysToSunday === 0
      ? t('header.sundayToday')
      : t('header.daysToSunday', { count: day.daysToSunday });
  return (
    <PageHeader
      title={t('title')}
      greeting={nickname ? t(`greeting.${partOfDay(now)}`, { name: nickname }) : undefined}
      subtitle={t('header.subtitle', {
        date: formatDay(date, i18n.language),
        week: day.weekNumber,
        countdown,
      })}
    />
  );
}
