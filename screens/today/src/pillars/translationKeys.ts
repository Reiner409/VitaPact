import type { Pillar, PillarField } from '@vitapact/core/pillars';
import { pillarKey } from '@vitapact/i18n';

function fieldKeysOf(pillar: string, field: PillarField): string[] {
  const own = [pillarKey.field(pillar, field.key)];
  switch (field.kind) {
    case 'number':
      return [...own, pillarKey.unit(field.unit)];
    case 'scale':
      return [
        ...own,
        ...rangeOf(field.min, field.max).map((value) =>
          pillarKey.scaleValue(pillar, field.key, value),
        ),
      ];
    case 'choice':
      return [
        ...own,
        ...field.options.map((option) => pillarKey.option(pillar, field.key, option)),
      ];
    case 'yesNo':
      return own;
  }
}

const rangeOf = (min: number, max: number) =>
  Array.from({ length: max - min + 1 }, (_, index) => min + index);

/** Every translation key the cards of these pillars can ask for. */
export function translationKeysOf(pillars: readonly Pillar[]): string[] {
  return pillars.flatMap((pillar) => [
    pillarKey.name(pillar.id),
    ...pillar.fields.flatMap((field) => fieldKeysOf(pillar.id, field)),
  ]);
}
