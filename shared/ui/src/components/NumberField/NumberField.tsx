import { NumberInput, Text } from '@mantine/core';
import { fieldErrorProps, fieldStyles, optional } from '../fieldProps';

export type NumberUnit = 'hours' | 'minutes' | 'kg';

export interface NumberFieldProps {
  label: string;
  unit: NumberUnit;
  /** Translated unit shown after the number, e.g. "h". */
  unitLabel: string;
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  description?: string;
  error?: string;
}

/** Step and decimals of each unit (section 6.2): hours by 0.5, minutes by 5, kg by 0.1. */
const numberUnits: Record<NumberUnit, { step: number; decimals: number }> = {
  hours: { step: 0.5, decimals: 1 },
  minutes: { step: 5, decimals: 0 },
  kg: { step: 0.1, decimals: 1 },
};

const toValue = (raw: number | string): number | null =>
  raw === '' ? null : typeof raw === 'number' ? raw : Number(raw);

export function NumberField({
  label,
  unit,
  unitLabel,
  value,
  onChange,
  min = 0,
  max,
  description,
  error,
}: NumberFieldProps) {
  const { step, decimals } = numberUnits[unit];
  return (
    <NumberInput
      label={label}
      value={value ?? ''}
      onChange={(raw) => onChange(toValue(raw))}
      step={step}
      decimalScale={decimals}
      min={min}
      {...optional('max', max)}
      {...optional('description', description)}
      {...optional('error', error)}
      clampBehavior="none"
      allowNegative={false}
      hideControls
      inputMode="decimal"
      rightSection={<Text c="var(--vp-color-text-muted)">{unitLabel}</Text>}
      errorProps={fieldErrorProps}
      styles={{
        ...fieldStyles,
        input: { ...fieldStyles.input, fontVariantNumeric: 'tabular-nums' },
      }}
    />
  );
}
