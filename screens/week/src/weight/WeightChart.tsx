import { type IsoWeek } from '@vitapact/core/calendar';
import { weightSeries } from '@vitapact/core/scoring';
import type { WeighIn } from '@vitapact/core/storage';
import { useTranslation } from '@vitapact/i18n';
import { EmptyState, TrendChart } from '@vitapact/ui';

export interface WeightChartProps {
  /** The chart ends with this week and covers the 12 before it (RF-08). */
  week: IsoWeek;
  weighIns: readonly WeighIn[];
}

const weekNumberOf = (week: IsoWeek) => week.slice(week.indexOf('W'));

/** RF-08: weight over the last 12 Sundays; a week without a weigh-in is a gap. */
export function WeightChart({ week, weighIns }: WeightChartProps) {
  const { t } = useTranslation('week');
  const points = weightSeries(week, weighIns);
  if (points.every(({ weightKg }) => weightKg === null)) {
    return <EmptyState icon="weighIn" title={t('weight.empty')} />;
  }
  return (
    <TrendChart
      label={t('weight.label')}
      points={points.map(({ week: pointWeek, weightKg }) => ({
        label: weekNumberOf(pointWeek),
        value: weightKg,
      }))}
      formatValue={(value) => t('weight.value', { value })}
      missingLabel={t('weight.missing')}
    />
  );
}
