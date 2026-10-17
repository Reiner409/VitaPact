import type { CalendarDate } from '@vitapact/core/calendar';
import { verdictBand } from '@vitapact/core/scoring';
import { useTranslation } from '@vitapact/i18n';
import { WeekStrip } from '@vitapact/ui';
import type { WeekDaySummary } from '../week/weekSummary';
import { formatDay } from './formatDay';

export interface WeekDaysProps {
  days: WeekDaySummary[];
  today: CalendarDate;
  onSelect: (day: WeekDaySummary) => void;
}

/** Section 5.3: seven tiles with each day's score and a dot of its band. */
export function WeekDays({ days, today, onSelect }: WeekDaysProps) {
  const { t, i18n } = useTranslation('week');
  const todayIndex = days.findIndex(({ date }) => date === today);
  return (
    <WeekStrip
      label={t('days.label')}
      missingLabel={t('days.missing')}
      todayLabel={t('days.today')}
      todayIndex={todayIndex === -1 ? null : todayIndex}
      days={days.map(({ date, score }) => ({
        dayName: formatDay(date, i18n.language, 'weekday'),
        score,
        band: score === null ? null : verdictBand(score),
      }))}
      onSelectDay={(index) => {
        const day = days[index];
        if (day) onSelect(day);
      }}
    />
  );
}
