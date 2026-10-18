import type { Pillar, PillarValues } from '@vitapact/core/pillars';
import { pillarKey, useTranslation } from '@vitapact/i18n';
import { PillarCard, type PillarFieldValue } from '@vitapact/ui';
import { liveErrorsOf, savedErrorsOf, type ShownErrorCode } from './fieldErrors';
import { pillarTextOf } from './pillarText';

export interface TodayPillarCardProps {
  pillar: Pillar;
  goal: number;
  values: PillarValues;
  onChange: (field: string, value: PillarFieldValue | undefined) => void;
  /** After a save attempt, empty fields are flagged too. */
  showMissing?: boolean;
}

type Translate = ReturnType<typeof useTranslation>['t'];

function errorMessage(t: Translate, pillar: Pillar, field: string, code: ShownErrorCode): string {
  const limits = pillar.fields.find((candidate) => candidate.key === field);
  const range = limits && 'min' in limits ? { min: limits.min, max: limits.max } : {};
  const step = limits?.kind === 'number' ? limits.step : 1;
  const messages: Record<ShownErrorCode, () => string> = {
    required: () => t('errors.required'),
    range: () => t('errors.range', range),
    step: () => t('errors.step', { step }),
    type: () => t('errors.type'),
    option: () => t('errors.option'),
  };
  return messages[code]();
}

/** One pillar's card for today, green once the day's goal is reached (section 5.2). */
export function TodayPillarCard({
  pillar,
  goal,
  values,
  onChange,
  showMissing = false,
}: TodayPillarCardProps) {
  const { t } = useTranslation('today');
  const shown = showMissing ? savedErrorsOf(pillar, values) : liveErrorsOf(pillar, values);
  const errors = Object.fromEntries(
    [...shown].map(([field, code]) => [field, errorMessage(t, pillar, field, code)]),
  );
  return (
    <PillarCard
      pillar={pillar}
      title={t(pillarKey.name(pillar.id))}
      text={pillarTextOf(t, pillar.id)}
      values={values}
      errors={errors}
      onChange={onChange}
      {...(pillar.isOnGoal(values, goal) ? { goalReachedLabel: t('goalReached') } : {})}
    />
  );
}
