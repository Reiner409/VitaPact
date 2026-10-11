import { Select as MantineSelect } from '@mantine/core';
import { fieldErrorProps, fieldStyles, optional } from '../fieldProps';

export interface SelectOption {
  value: string;
  /** Translated text of the option. */
  label: string;
}

export interface SelectProps {
  label: string;
  options: SelectOption[];
  value: string | null;
  onChange: (value: string) => void;
  /** Lets the user type to filter the list. */
  searchable?: boolean;
  placeholder?: string;
  error?: string;
}

export function Select({
  label,
  options,
  value,
  onChange,
  searchable = false,
  placeholder,
  error,
}: SelectProps) {
  return (
    <MantineSelect
      label={label}
      data={options}
      value={value}
      onChange={(next) => {
        if (next !== null) onChange(next);
      }}
      searchable={searchable}
      allowDeselect={false}
      {...optional('placeholder', placeholder)}
      {...optional('error', error)}
      errorProps={fieldErrorProps}
      styles={fieldStyles}
    />
  );
}
