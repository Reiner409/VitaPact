import { Button } from '../Button/Button';
import { ChipGroup } from '../ChipGroup/ChipGroup';
import { NumberField, type NumberUnit } from '../NumberField/NumberField';
import { ScaleInput, type ScaleValue } from '../ScaleInput/ScaleInput';
import { Stack } from '../Stack/Stack';
import { YesNoToggle } from '../YesNoToggle/YesNoToggle';
import type { PillarCardField, PillarFieldValue } from './pillarShape';

/** Every text a pillar's fields need, translated by the screen. */
export interface PillarCardText {
  fieldLabel: (field: string) => string;
  unitLabel: (unit: string) => string;
  optionLabel: (field: string, option: string) => string;
  scaleValueLabel: (field: string, value: ScaleValue) => string;
  /** Name of a quick value button, e.g. "30 min". */
  quickValueLabel: (unit: string, value: number) => string;
  yes: string;
  no: string;
}

export interface PillarFieldProps {
  field: PillarCardField;
  value: PillarFieldValue | undefined;
  text: PillarCardText;
  error: string | undefined;
  onChange: (value: PillarFieldValue | undefined) => void;
}

const NUMBER_UNITS: readonly string[] = ['hours', 'minutes', 'kg'] satisfies NumberUnit[];

const isNumberUnit = (unit: string): unit is NumberUnit => NUMBER_UNITS.includes(unit);

/** Known units keep NumberField's own steps; any other unit (a new pillar's litres) uses the field's step. */
const numberStepping = (field: FieldOf<'number'>) =>
  isNumberUnit(field.unit) ? { unit: field.unit } : { unit: 'hours' as const, step: field.step };

const asNumber = (value: PillarFieldValue | undefined) =>
  typeof value === 'number' ? value : null;

type FieldOf<Kind extends PillarCardField['kind']> = Extract<PillarCardField, { kind: Kind }>;

interface KindProps<Kind extends PillarCardField['kind']> extends Omit<PillarFieldProps, 'field'> {
  field: FieldOf<Kind>;
  label: string;
}

/** One field of a pillar, drawn with the base component of its kind. */
export function PillarField(props: PillarFieldProps) {
  const label = props.text.fieldLabel(props.field.key);
  switch (props.field.kind) {
    case 'number':
      return <NumberPillarField {...props} field={props.field} label={label} />;
    case 'scale':
      return <ScalePillarField {...props} field={props.field} label={label} />;
    case 'yesNo':
      return <YesNoPillarField {...props} field={props.field} label={label} />;
    case 'choice':
      return <ChoicePillarField {...props} field={props.field} label={label} />;
  }
}

function NumberPillarField(props: KindProps<'number'>) {
  const { field, text, onChange } = props;
  if (!field.quickValues?.length) return <PlainNumberPillarField {...props} />;
  return (
    <Stack gap="tight">
      <PlainNumberPillarField {...props} />
      <Stack horizontal gap="tight">
        {field.quickValues.map((quick) => (
          <Button key={quick} variant="secondary" onClick={() => onChange(quick)}>
            {text.quickValueLabel(field.unit, quick)}
          </Button>
        ))}
      </Stack>
    </Stack>
  );
}

function PlainNumberPillarField({
  field,
  label,
  value,
  text,
  error,
  onChange,
}: KindProps<'number'>) {
  return (
    <NumberField
      label={label}
      {...numberStepping(field)}
      unitLabel={text.unitLabel(field.unit)}
      value={asNumber(value)}
      onChange={(next) => onChange(next ?? undefined)}
      min={field.min}
      max={field.max}
      {...(error ? { error } : {})}
    />
  );
}

function ScalePillarField({ field, label, value, text, onChange }: KindProps<'scale'>) {
  return (
    <ScaleInput
      label={label}
      value={asNumber(value) as ScaleValue | null}
      onChange={onChange}
      getValueLabel={(dot) => text.scaleValueLabel(field.key, dot)}
    />
  );
}

function YesNoPillarField({ label, value, text, onChange }: KindProps<'yesNo'>) {
  return (
    <YesNoToggle
      label={label}
      yesLabel={text.yes}
      noLabel={text.no}
      value={typeof value === 'boolean' ? value : null}
      onChange={onChange}
    />
  );
}

function ChoicePillarField({ field, label, value, text, onChange }: KindProps<'choice'>) {
  const options = field.options.map((option) => ({
    value: option,
    label: text.optionLabel(field.key, option),
  }));
  return (
    <ChipGroup
      label={label}
      options={options}
      value={typeof value === 'string' ? value : null}
      onChange={onChange}
    />
  );
}
