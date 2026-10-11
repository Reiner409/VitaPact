import { Textarea, TextInput, type InputWrapperProps } from '@mantine/core';
import { fieldErrorProps, fieldStyles, optional } from '../fieldProps';

export interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  /** Builds the translated counter shown under the field from the current length and the maximum. */
  formatCounter?: (length: number, max: number) => string;
  description?: string;
  placeholder?: string;
  error?: string;
}

const COUNTER_UNDER_FIELD: NonNullable<InputWrapperProps['inputWrapperOrder']> = [
  'label',
  'input',
  'description',
  'error',
];

function sharedProps({
  label,
  value,
  onChange,
  maxLength,
  formatCounter,
  description,
  placeholder,
  error,
}: TextFieldProps) {
  const counter =
    formatCounter && maxLength !== undefined ? formatCounter(value.length, maxLength) : undefined;
  return {
    label,
    value,
    onChange: (event: { currentTarget: { value: string } }) => onChange(event.currentTarget.value),
    ...optional('maxLength', maxLength),
    ...optional('description', counter ?? description),
    ...optional('placeholder', placeholder),
    ...optional('error', error),
    errorProps: fieldErrorProps,
    inputWrapperOrder: COUNTER_UNDER_FIELD,
  };
}

/** One line of free text, optionally with a character counter under it. */
export function TextField(props: TextFieldProps) {
  return <TextInput {...sharedProps(props)} styles={fieldStyles} />;
}

/** Several lines of free text; the user can drag it taller. */
export function TextArea(props: TextFieldProps) {
  return <Textarea {...sharedProps(props)} rows={4} resize="vertical" styles={fieldStyles} />;
}
