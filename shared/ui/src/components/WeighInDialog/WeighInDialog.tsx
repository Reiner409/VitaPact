import { Checkbox, Group, Stack } from '@mantine/core';
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

const fastingLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  minHeight: touchTarget.minHeight,
};

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
  const submit = () => {
    if (weight === null || !fasting) return;
    const inRange = weight >= minKg && weight <= maxKg;
    setOutOfRange(!inRange);
    if (inRange) onSave(weight);
  };
  return { weight, setWeight, fasting, setFasting, outOfRange, submit };
}

function WeighInForm({ labels, onLater, ...limits }: Omit<WeighInDialogProps, 'opened'>) {
  const { weight, setWeight, fasting, setFasting, outOfRange, submit } = useWeighInForm(limits);
  return (
    <Stack gap="md">
      <NumberField
        label={labels.weight}
        unit="kg"
        unitLabel={labels.unit}
        value={weight}
        onChange={setWeight}
        {...(outOfRange ? { error: labels.outOfRange } : {})}
      />
      <Checkbox
        label={labels.fasting}
        checked={fasting}
        onChange={(event) => setFasting(event.currentTarget.checked)}
        styles={{ body: { alignItems: 'center' }, label: fastingLabelStyle }}
      />
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
