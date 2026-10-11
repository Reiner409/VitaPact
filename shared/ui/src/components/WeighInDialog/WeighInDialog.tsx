import { Checkbox, Group, Stack, Text } from '@mantine/core';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { Modal } from '../Modal/Modal';
import { NumberField } from '../NumberField/NumberField';
import { touchTarget } from '../touchTarget';

/** Every text of the dialog, already translated. */
export interface WeighInDialogLabels {
  title: string;
  close: string;
  weight: string;
  unit: string;
  /** The required "on an empty stomach, before breakfast" confirmation. */
  fasting: string;
  save: string;
  later: string;
  outOfRange: string;
}

export interface WeighInDialogProps {
  opened: boolean;
  labels: WeighInDialogLabels;
  minKg: number;
  maxKg: number;
  onSave: (weightKg: number) => void;
  /** Postpones the weigh-in; the screen keeps the reminder banner (RF-06). */
  onLater: () => void;
}

/** The Sunday weigh-in: weight in kg, saved only with the empty-stomach confirmation (RF-05). */
export function WeighInDialog({ opened, labels, onLater, ...form }: WeighInDialogProps) {
  return (
    <Modal opened={opened} onClose={onLater} title={labels.title} closeLabel={labels.close}>
      {opened && <WeighInForm labels={labels} onLater={onLater} {...form} />}
    </Modal>
  );
}

function useWeighInForm({
  minKg,
  maxKg,
  onSave,
}: Pick<WeighInDialogProps, 'minKg' | 'maxKg' | 'onSave'>) {
  const [weight, setWeight] = useState<number | null>(null);
  const [fasting, setFasting] = useState(false);
  const [outOfRange, setOutOfRange] = useState(false);
  const changeWeight = (next: number | null) => {
    setWeight(next);
    setOutOfRange(false);
  };
  const submit = () => {
    if (weight === null || !fasting) return;
    const inRange = weight >= minKg && weight <= maxKg;
    setOutOfRange(!inRange);
    if (inRange) onSave(weight);
  };
  return { weight, changeWeight, fasting, setFasting, outOfRange, submit };
}

function WeighInForm({ labels, onLater, ...limits }: Omit<WeighInDialogProps, 'opened'>) {
  const { weight, changeWeight, fasting, setFasting, outOfRange, submit } = useWeighInForm(limits);
  return (
    <Stack gap="md">
      <NumberField
        label={labels.weight}
        unit="kg"
        unitLabel={labels.unit}
        value={weight}
        onChange={changeWeight}
        {...(outOfRange ? { error: labels.outOfRange } : {})}
      />
      <FastingCheck label={labels.fasting} checked={fasting} onChange={setFasting} />
      <Group justify="flex-end" gap="sm">
        <Button variant="subtle" onClick={onLater}>
          {labels.later}
        </Button>
        <Button disabled={weight === null || !fasting} onClick={submit}>
          {labels.save}
        </Button>
      </Group>
    </Stack>
  );
}

interface FastingCheckProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** The whole row is the checkbox, so the target is at least 44 px high (G4.6). */
function FastingCheck({ label, checked, onChange }: FastingCheckProps) {
  return (
    <Checkbox.Card
      checked={checked}
      onChange={onChange}
      radius="sm"
      p="sm"
      style={{ minHeight: touchTarget.minHeight }}
    >
      <Group wrap="nowrap" gap="sm">
        <Checkbox.Indicator />
        <Text component="span">{label}</Text>
      </Group>
    </Checkbox.Card>
  );
}
