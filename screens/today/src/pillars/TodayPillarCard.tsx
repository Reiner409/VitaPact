import type { Pillar, PillarValues } from '@vitapact/core/pillars';
import { useTranslation } from '@vitapact/i18n';
import { PillarCard, type PillarFieldValue } from '@vitapact/ui';
import { liveErrorsOf, type LiveErrorCode } from './fieldErrors';
import { pillarKey, pillarTextOf } from './pillarText';

export interface TodayPillarCardProps {
  pillar: Pillar;
  goal: number;
  values: PillarValues;
  onChange: (field: string, value: PillarFieldValue | undefined) => void;
}

type Translate = ReturnType<typeof useTranslation>['t'];

function errorMessage(t: Translate, pillar: Pillar, field: string, code: LiveErrorCode): string {
  const limits = pillar.fields.find((candidate) => candidate.key === field);
  const range = limits && 'min' in limits ? { min: limits.min, max: limits.max } : {};
  const step = limits?.kind === 'number' ? limits.step : 1;
  const messages: Record<LiveErrorCode, () => string> = {
    range: () => t('errors.range', range),
    step: () => t('errors.step', { step }),
    type: () => t('errors.type'),
  };
  return messages[code]();
}

/** One pillar's card for today, green once the day's goal is reached (section 5.2). */
export function TodayPillarCard({ pillar, goal, values, onChange }: TodayPillarCardProps) {
  const { t } = useTranslation('today');
  const errors = Object.fromEntries(
    [...liveErrorsOf(pillar, values)].map(([field, code]) => [
      field,
      errorMessage(t, pillar, field, code),
    ]),
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
