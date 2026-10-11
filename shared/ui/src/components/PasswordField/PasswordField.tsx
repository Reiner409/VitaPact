import { PasswordInput } from '@mantine/core';
import { useId, useState } from 'react';
import { fieldErrorProps, fieldStyles, optional } from '../fieldProps';
import { touchTarget } from '../touchTarget';

export interface PasswordFieldProps {
  label: string;
  /** Translated names of the visibility button. */
  showLabel: string;
  hideLabel: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete?: 'current-password' | 'new-password';
}

/** Password with a show/hide button that the keyboard reaches too. */
export function PasswordField({
  label,
  showLabel,
  hideLabel,
  value,
  onChange,
  error,
  autoComplete = 'current-password',
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const errorId = useId();
  return (
    <PasswordInput
      label={label}
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      {...optional('error', error)}
      // Mantine leaves the inner input without aria wiring, so the error is linked here.
      aria-invalid={Boolean(error)}
      {...optional('aria-describedby', error ? errorId : undefined)}
      autoComplete={autoComplete}
      visible={visible}
      onVisibilityChange={setVisible}
      visibilityToggleButtonProps={{
        'aria-label': visible ? hideLabel : showLabel,
        tabIndex: 0,
        style: touchTarget,
      }}
      rightSectionWidth={touchTarget.minWidth}
      errorProps={{ ...fieldErrorProps, id: errorId }}
      styles={fieldStyles}
    />
  );
}
