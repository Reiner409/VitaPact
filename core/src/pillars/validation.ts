import type {
  ChoiceField,
  FieldError,
  FieldErrorCode,
  FieldValue,
  NumberField,
  Pillar,
  PillarField,
  PillarValues,
  ScaleField,
} from './types';

export function validatePillarValues(pillar: Pillar, values: PillarValues): FieldError[] {
  return pillar.fields
    .filter((field) => isAsked(field, values))
    .flatMap((field) => {
      const code = fieldErrorCode(field, values[field.key]);
      return code ? [{ field: field.key, code }] : [];
    });
}

function isAsked(field: PillarField, values: PillarValues): boolean {
  return !field.askedWhen || values[field.askedWhen.key] === field.askedWhen.equals;
}

function fieldErrorCode(field: PillarField, value: FieldValue | undefined): FieldErrorCode | null {
  if (value === undefined) return 'required';
  switch (field.kind) {
    case 'number':
      return numberErrorCode(field, value);
    case 'scale':
      return numberErrorCode({ ...field, step: 1 }, value);
    case 'yesNo':
      return typeof value === 'boolean' ? null : 'type';
    case 'choice':
      return choiceErrorCode(field, value);
  }
}

function numberErrorCode(
  field: Pick<NumberField | ScaleField, 'min' | 'max'> & { step: number },
  value: FieldValue,
): FieldErrorCode | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'type';
  if (value < field.min || value > field.max) return 'range';
  return isStepOf(value - field.min, field.step) ? null : 'step';
}

/** Rounding absorbs floating point noise, e.g. 0.3 / 0.1 is 2.9999999999999996. */
function isStepOf(value: number, step: number): boolean {
  return Number.isInteger(Math.round((value / step) * 1e9) / 1e9);
}

function choiceErrorCode(field: ChoiceField, value: FieldValue): FieldErrorCode | null {
  if (typeof value !== 'string') return 'type';
  return field.options.includes(value) ? null : 'option';
}
