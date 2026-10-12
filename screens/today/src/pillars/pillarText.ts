import type { useTranslation } from '@vitapact/i18n';
import type { PillarCardText } from '@vitapact/ui';

type Translate = ReturnType<typeof useTranslation>['t'];

/**
 * Pillar keys are built from the pillar modules, so a new pillar only adds translations (RF-23).
 * `translationKeysOf` lists them and a test checks each one against the English file (G5.3).
 */
export const pillarKey = {
  name: (pillar: string) => `pillars.${pillar}.name`,
  field: (pillar: string, field: string) => `pillars.${pillar}.fields.${field}`,
  option: (pillar: string, field: string, option: string) =>
    `pillars.${pillar}.options.${field}.${option}`,
  scaleValue: (pillar: string, field: string, value: number) =>
    `pillars.${pillar}.scale.${field}.${value}`,
  unit: (unit: string) => `units.${unit}`,
};

export function pillarTextOf(t: Translate, pillar: string): PillarCardText {
  return {
    fieldLabel: (field) => t(pillarKey.field(pillar, field)),
    unitLabel: (unit) => t(pillarKey.unit(unit)),
    optionLabel: (field, option) => t(pillarKey.option(pillar, field, option)),
    scaleValueLabel: (field, value) => t(pillarKey.scaleValue(pillar, field, value)),
    yes: t('today:answers.yes'),
    no: t('today:answers.no'),
  };
}
