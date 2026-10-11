import { Button, Group, Text } from '@mantine/core';
import { useId } from 'react';
import { tokens } from '../../tokens';
import { touchTarget } from '../touchTarget';

export interface YesNoToggleProps {
  label: string;
  yesLabel: string;
  noLabel: string;
  /** `null` while the user has not answered. */
  value: boolean | null;
  onChange: (value: boolean) => void;
}

/** Two pressable buttons; neither is pressed until the user answers. */
export function YesNoToggle({ label, yesLabel, noLabel, value, onChange }: YesNoToggleProps) {
  const labelId = useId();
  const choices = [
    { answer: true, text: yesLabel },
    { answer: false, text: noLabel },
  ];
  return (
    <div>
      <Text id={labelId} fw={500} mb={tokens.space[1]}>
        {label}
      </Text>
      <Group role="group" aria-labelledby={labelId} gap="xs">
        {choices.map(({ answer, text }) => (
          <Button
            key={text}
            type="button"
            variant={value === answer ? 'filled' : 'outline'}
            aria-pressed={value === answer}
            onClick={() => onChange(answer)}
            fw={500}
            style={{ minHeight: touchTarget.minHeight }}
          >
            {text}
          </Button>
        ))}
      </Group>
    </div>
  );
}
