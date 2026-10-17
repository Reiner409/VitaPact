import type { FieldValue, Pillar, PillarField, PillarValues } from '@vitapact/core/pillars';
import { pillarKey, type useTranslation } from '@vitapact/i18n';

type Translate = ReturnType<typeof useTranslation>['t'];

function answerText(t: Translate, pillar: string, field: PillarField, value: FieldValue): string {
  switch (field.kind) {
    case 'number':
      return `${String(value)} ${t(pillarKey.unit(field.unit))}`;
    case 'scale':
      return t(pillarKey.scaleValue(pillar, field.key, Number(value)));
    case 'yesNo':
      return t(value === true ? pillarKey.yes : pillarKey.no);
    case 'choice':
      return t(pillarKey.option(pillar, field.key, String(value)));
  }
}

export interface AnswerLine {
  label: string;
  answer: string;
}

/** One line per answered field of the pillar, in the order the pillar asks them. */
export function answerLines(t: Translate, pillar: Pillar, values: PillarValues): AnswerLine[] {
  return pillar.fields.flatMap((field) => {
    const value = values[field.key];
    if (value === undefined) return [];
    return [
      {
        label: t(pillarKey.field(pillar.id, field.key)),
        answer: answerText(t, pillar.id, field, value),
      },
    ];
  });
}
