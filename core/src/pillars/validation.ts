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
  const askedFields = pillar.fields.filter((field) => isAsked(field, values));
  const askedKeys = new Set(askedFields.map((field) => field.key));
  const fieldErrors = askedFields.flatMap((field) => {
    const code = fieldErrorCode(field, values[field.key]);
    return code ? [{ field: field.key, code }] : [];
  });
  return [...fieldErrors, ...unexpectedFieldErrors(values, askedKeys)];
}

/** A value that was not asked for, such as minutes on a day without training, would skew the totals. */
function unexpectedFieldErrors(values: PillarValues, askedKeys: ReadonlySet<string>): FieldError[] {
  return Object.entries(values)
    .filter(([key, value]) => value !== undefined && !askedKeys.has(key))
    .map(([key]) => ({ field: key, code: 'unexpected' }));
}

/** Whether a field is asked, given the other answers of its pillar. */
export function isAsked(field: PillarField, values: PillarValues): boolean {
  const condition = field.askedWhen;
  if (!condition) return true;
  const value = values[condition.key];
  if ('above' in condition) return typeof value === 'number' && value > condition.above;
  return value === condition.equals;
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
