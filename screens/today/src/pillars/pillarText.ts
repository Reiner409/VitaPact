import { pillarKey, type useTranslation } from '@vitapact/i18n';
import type { PillarCardText } from '@vitapact/ui';

type Translate = ReturnType<typeof useTranslation>['t'];

export function pillarTextOf(t: Translate, pillar: string): PillarCardText {
  return {
    fieldLabel: (field) => t(pillarKey.field(pillar, field)),
    unitLabel: (unit) => t(pillarKey.unit(unit)),
    optionLabel: (field, option) => t(pillarKey.option(pillar, field, option)),
    scaleValueLabel: (field, value) => t(pillarKey.scaleValue(pillar, field, value)),
    quickValueLabel: (unit, value) =>
      t('today:quickValue', { value, unit: t(pillarKey.unit(unit)) }),
    yes: t(pillarKey.yes),
    no: t(pillarKey.no),
  };
}
