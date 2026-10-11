import { Group, Stack, Text, TextInput } from '@mantine/core';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { Modal } from '../Modal/Modal';

export interface TypedConfirmation {
  /** The exact word the user must type, e.g. the translated "DELETE". */
  word: string;
  /** Translated label of the field. */
  label: string;
}

export interface ConfirmDialogProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  closeLabel: string;
  destructive?: boolean;
  /** Double confirmation: confirm stays disabled until the word is typed exactly. */
  typedConfirmation?: TypedConfirmation;
}

export function ConfirmDialog({ opened, onClose, title, closeLabel, ...body }: ConfirmDialogProps) {
  return (
    <Modal opened={opened} onClose={onClose} title={title} closeLabel={closeLabel} size="small">
      {opened && <ConfirmBody onClose={onClose} {...body} />}
    </Modal>
  );
}

type ConfirmBodyProps = Omit<ConfirmDialogProps, 'opened' | 'title' | 'closeLabel'>;

function ConfirmBody({
  onClose,
  onConfirm,
  message,
  confirmLabel,
  cancelLabel,
  destructive = false,
  typedConfirmation,
}: ConfirmBodyProps) {
  const [typed, setTyped] = useState('');
  const confirmed = !typedConfirmation || typed === typedConfirmation.word;

  return (
    <Stack gap="md">
      <Text>{message}</Text>
      {typedConfirmation && (
        <TextInput
          label={typedConfirmation.label}
          value={typed}
          onChange={(event) => setTyped(event.currentTarget.value)}
          autoComplete="off"
          spellCheck={false}
        />
      )}
      <Group justify="flex-end" gap="sm">
        <Button variant="secondary" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button
          variant={destructive ? 'destructive' : 'primary'}
          disabled={!confirmed}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </Group>
    </Stack>
  );
}
