import { mondayOf, sundayOf, type IsoWeek } from '@vitapact/core/calendar';
import { useTranslation } from '@vitapact/i18n';
import { IconButton, Stack } from '@vitapact/ui';
import { formatDay } from '../days/formatDay';

export interface WeekSelectorProps {
  week: IsoWeek;
  /** The forward arrow stops at the current week (RF-08). */
  isCurrentWeek: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

const weekNumberOf = (week: IsoWeek) => Number(week.slice(week.indexOf('W') + 1));

export function WeekSelector({ week, isCurrentWeek, onPrevious, onNext }: WeekSelectorProps) {
  const { t, i18n } = useTranslation('week');
  return (
    <Stack horizontal gap="tight">
      <IconButton icon="previous" label={t('selector.previous')} onClick={onPrevious} />
      <p>
        {t('selector.label', {
          week: weekNumberOf(week),
          from: formatDay(mondayOf(week), i18n.language, 'short'),
          to: formatDay(sundayOf(week), i18n.language, 'short'),
        })}
      </p>
      <IconButton
        icon="next"
        label={t('selector.next')}
        onClick={onNext}
        disabled={isCurrentWeek}
      />
    </Stack>
  );
}
