import { Chip, Group, Text } from '@mantine/core';
import { useId } from 'react';
import { tokens } from '../../tokens';

export interface ChipOption {
  value: string;
  /** Translated text of the chip. */
  label: string;
}

interface ChipGroupBase {
  label: string;
  options: ChipOption[];
}

export interface SingleChipGroupProps extends ChipGroupBase {
  multiple?: false;
  value: string | null;
  onChange: (value: string) => void;
}

export interface MultipleChipGroupProps extends ChipGroupBase {
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
}

export type ChipGroupProps = SingleChipGroupProps | MultipleChipGroupProps;

/** Short choices: one at a time (radio group) or several (group of checkboxes). */
export function ChipGroup(props: ChipGroupProps) {
  const labelId = useId();
  return (
    <div>
      <Text id={labelId} fw={tokens.font.weight.medium} mb={tokens.space[1]}>
        {props.label}
      </Text>
      <Group role={props.multiple ? 'group' : 'radiogroup'} aria-labelledby={labelId} gap="xs">
        {props.multiple ? <MultipleChips {...props} /> : <SingleChips {...props} />}
      </Group>
    </div>
  );
}

function Chips({ options }: { options: ChipOption[] }) {
  return options.map(({ value, label }) => (
    <Chip
      key={value}
      value={value}
      radius="xl"
      size="md"
      styles={{ label: { minHeight: tokens.layout.minTouchTarget } }}
    >
      {label}
    </Chip>
  ));
}

function SingleChips({ options, value, onChange }: SingleChipGroupProps) {
  return (
    <Chip.Group multiple={false} value={value} onChange={onChange}>
      <Chips options={options} />
    </Chip.Group>
  );
}

function MultipleChips({ options, value, onChange }: MultipleChipGroupProps) {
  return (
    <Chip.Group multiple value={value} onChange={onChange}>
      <Chips options={options} />
    </Chip.Group>
  );
}
