import { Button, FileButton, Input, Loader, Stack, Text } from '@mantine/core';
import { useId, useState, type DragEvent } from 'react';
import { AppIcon } from '../../icons/AppIcon';
import { tokens } from '../../tokens';
import { fieldErrorProps } from '../fieldProps';
import { touchTarget } from '../touchTarget';

export type FilePickerState = 'idle' | 'reading' | 'error';

export interface FilePickerProps {
  /** Translated text of the button. */
  label: string;
  /** Translated hint for dragging, e.g. "or drop the image here". */
  hint: string;
  state: FilePickerState;
  /** Translated error, shown in the `error` state. */
  error?: string;
  onFile: (file: File) => void;
  /** Called instead of `onFile` for anything that is not an image. */
  onInvalidFile: (file: File) => void;
}

const isImage = (file: File) => file.type.startsWith('image/');

function useDropZone(accept: (file: File | undefined) => void) {
  const [dragging, setDragging] = useState(false);
  const handlers = {
    onDragOver: (event: DragEvent) => {
      event.preventDefault();
      setDragging(true);
    },
    onDragLeave: () => setDragging(false),
    onDrop: (event: DragEvent) => {
      event.preventDefault();
      setDragging(false);
      accept(event.dataTransfer.files[0]);
    },
  };
  return { dragging, handlers };
}

const zoneStyle = (dragging: boolean, hasError: boolean) => ({
  border: `${tokens.focus.width}px dashed var(--vp-color-${hasError ? 'danger' : 'border'})`,
  backgroundColor: `var(--vp-color-${dragging ? 'primary-soft' : 'surface'})`,
});

interface ChooseButtonProps {
  label: string;
  reading: boolean;
  describedBy: string | undefined;
  onChange: (file: File | null) => void;
}

function ChooseButton({ label, reading, describedBy, onChange }: ChooseButtonProps) {
  return (
    <FileButton onChange={onChange} accept="image/*" disabled={reading}>
      {(props) => (
        <Button
          {...props}
          variant="outline"
          disabled={reading}
          aria-describedby={describedBy}
          style={{ minHeight: touchTarget.minHeight }}
        >
          {label}
        </Button>
      )}
    </FileButton>
  );
}

/** Choose an image with the button or drop it on the zone. */
export function FilePicker({ label, hint, state, error, onFile, onInvalidFile }: FilePickerProps) {
  const errorId = useId();
  const reading = state === 'reading';
  const shownError = state === 'error' ? error : undefined;
  const accept = (file: File | null | undefined) => {
    if (!file || reading) return;
    if (isImage(file)) onFile(file);
    else onInvalidFile(file);
  };
  const { dragging, handlers } = useDropZone(accept);

  return (
    <Stack gap={tokens.space[1]}>
      <Stack
        data-dropzone
        data-dragging={dragging}
        aria-busy={reading}
        align="center"
        gap="sm"
        p="lg"
        bdrs="md"
        style={zoneStyle(dragging, Boolean(shownError))}
        {...handlers}
      >
        {reading ? <Loader size="sm" /> : <AppIcon name="image" />}
        <ChooseButton
          label={label}
          reading={reading}
          describedBy={shownError ? errorId : undefined}
          onChange={accept}
        />
        <Text c="var(--vp-color-text-muted)">{hint}</Text>
      </Stack>
      {shownError && (
        <Input.Error id={errorId} {...fieldErrorProps}>
          {shownError}
        </Input.Error>
      )}
    </Stack>
  );
}
