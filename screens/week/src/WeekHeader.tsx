import type { IsoWeek } from '@vitapact/core/calendar';
import { useTranslation } from '@vitapact/i18n';
import { IconButton, PageHeader } from '@vitapact/ui';
import { atUtcMidnight, canGoForward, weekRange } from './week/weekNavigation';

export interface WeekHeaderProps {
  week: IsoWeek;
  currentWeek: IsoWeek;
  onPrevious: () => void;
  onNext: () => void;
}

/** F3-WK-01: the shown week with arrows; forward stops at the current week. */
export function WeekHeader({ week, currentWeek, onPrevious, onNext }: WeekHeaderProps) {
  const { t } = useTranslation('week');
  const { number, from, to } = weekRange(week);
  const range = t('range', { number, from: atUtcMidnight(from), to: atUtcMidnight(to) });
  return (
    <PageHeader
      title={t('title')}
      subtitle={range}
      action={
        <div>
          <IconButton icon="previous" label={t('selector.previous')} onClick={onPrevious} />
          <IconButton
            icon="next"
            label={t('selector.next')}
            disabled={!canGoForward(week, currentWeek)}
            onClick={onNext}
          />
        </div>
      }
    />
  );
}
