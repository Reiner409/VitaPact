import type { CalendarDate } from '@vitapact/core/calendar';
import { verdictBand } from '@vitapact/core/scoring';
import { useTranslation } from '@vitapact/i18n';
import { WeekStrip } from '@vitapact/ui';
import type { WeekDay } from './weekDays';

export interface TodayWeekStripProps {
  days: WeekDay[];
  today: CalendarDate;
  /** Only today and the days before it can be opened. */
  onSelectDay: (date: CalendarDate) => void;
}

const shortDayName = (date: CalendarDate, language: string) =>
  new Intl.DateTimeFormat(language, { weekday: 'short', timeZone: 'UTC' }).format(
    new Date(`${date}T00:00:00Z`),
  );

/** Section 5.2: the seven days of the week, filled once logged. */
export function TodayWeekStrip({ days, today, onSelectDay }: TodayWeekStripProps) {
  const { t, i18n } = useTranslation('today');
  const todayIndex = days.findIndex(({ date }) => date === today);
  return (
    <WeekStrip
      label={t('week.label')}
      missingLabel={t('week.missing')}
      todayLabel={t('week.today')}
      todayIndex={todayIndex === -1 ? null : todayIndex}
      days={days.map(({ date, score }) => ({
        dayName: shortDayName(date, i18n.language),
        score,
        band: score === null ? null : verdictBand(score),
      }))}
      onSelectDay={(index) => {
        const day = days[index];
        if (day && day.date <= today) onSelectDay(day.date);
      }}
    />
  );
}
