import { ActionIcon, NumberInput } from '@mantine/core';
import { AppIcon, type IconName } from '../../icons/AppIcon';
import { tokens } from '../../tokens';
import { touchTarget } from '../touchTarget';
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
  /** Overrides the unit's step, e.g. 0.25 for a new pillar's litres; decimals follow it. */
  step?: number;
  description?: string;
  error?: string;
}

/** Step and decimals of each unit (section 6.2): hours by 0.5, minutes by 5, kg by 0.1. */
const numberUnits: Record<NumberUnit, { step: number; decimals: number }> = {
  hours: { step: 0.5, decimals: 1 },
  minutes: { step: 5, decimals: 0 },
  kg: { step: 0.1, decimals: 1 },
};

/** A non-breaking space between the number and its unit. */
const UNIT_GAP = '\u00a0';

const decimalsOf = (step: number) => step.toString().split('.')[1]?.length ?? 0;

const stepping = (unit: NumberUnit, step: number | undefined) =>
  step === undefined ? numberUnits[unit] : { step, decimals: decimalsOf(step) };

const toValue = (raw: number | string): number | null =>
  raw === '' ? null : typeof raw === 'number' ? raw : Number(raw);

interface Limits {
  decimals: number;
  min: number;
  max: number | undefined;
}

/** One step up or down from the value (or from the minimum when empty), kept within the limits. */
function stepped(value: number | null, by: number, { decimals, min, max }: Limits) {
  const next = Number(((value ?? min) + by).toFixed(decimals));
  return Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min, next));
}

/**
 * The − and + of the stepper. They are a pointer shortcut only: the field itself takes the
 * arrow keys, so the buttons stay out of the tab order and out of the accessibility tree.
 */
function StepButton({ icon, onStep }: { icon: IconName; onStep: () => void }) {
  return (
    <ActionIcon
      variant="subtle"
      radius="xl"
      size={tokens.layout.minTouchTarget}
      c="var(--vp-color-primary-strong)"
      aria-hidden="true"
      tabIndex={-1}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onStep}
    >
      <AppIcon name={icon} />
    </ActionIcon>
  );
}

const stepperStyles = {
  ...fieldStyles,
  input: {
    ...fieldStyles.input,
    fontVariantNumeric: tokens.font.numericVariant,
    textAlign: 'center' as const,
    fontSize: tokens.font.h2.size,
    fontWeight: tokens.font.weight.semibold,
    borderRadius: tokens.radius.full,
  },
  section: { paddingInline: tokens.space[1] },
};

/** What every stepper shares, whatever its unit and limits. */
const fixedProps = {
  clampBehavior: 'none',
  allowNegative: false,
  hideControls: true,
  inputMode: 'decimal',
  leftSectionWidth: touchTarget.minWidth + tokens.space[2],
  leftSectionPointerEvents: 'all',
  rightSectionWidth: touchTarget.minWidth + tokens.space[2],
  rightSectionPointerEvents: 'all',
  errorProps: fieldErrorProps,
  maw: tokens.layout.fieldMaxWidth,
  styles: stepperStyles,
} as const;

/** Apple-style stepper: − and + around the number, centred, with its unit spelled out. */
export function NumberField({
  label,
  unit,
  unitLabel,
  value,
  onChange,
  min = 0,
  max,
  step: stepOverride,
  description,
  error,
}: NumberFieldProps) {
  const { step, decimals } = stepping(unit, stepOverride);
  const stepBy = (by: number) => onChange(stepped(value, by, { decimals, min, max }));
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
      {...fixedProps}
      // Phone keyboards in many languages offer a comma as the decimal key.
      allowedDecimalSeparators={[',', '.']}
      leftSection={<StepButton icon="decrease" onStep={() => stepBy(-step)} />}
      suffix={UNIT_GAP + unitLabel}
      rightSection={<StepButton icon="increase" onStep={() => stepBy(step)} />}
    />
  );
}
