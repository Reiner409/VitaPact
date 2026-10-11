import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../testing';
import { renderWithTheme } from '../../testing/renderWithTheme';
import { FilePicker, type FilePickerProps } from './FilePicker';

const image = new File(['png'], 'report.png', { type: 'image/png' });
const text = new File(['hello'], 'notes.txt', { type: 'text/plain' });

function renderPicker(props: Partial<FilePickerProps> = {}) {
  const handlers = { onFile: vi.fn(), onInvalidFile: vi.fn() };
  renderWithTheme(
    <FilePicker
      label="Choose image"
      hint="or drop it here"
      state="idle"
      {...handlers}
      {...props}
    />,
  );
  return handlers;
}

const dropZone = () => screen.getByText('or drop it here').closest('[data-dropzone]')!;
const drop = (file: File) => fireEvent.drop(dropZone(), { dataTransfer: { files: [file] } });

describe('F2-17 FilePicker', () => {
  it('RNF-10 opens the file chooser from a keyboard-reachable button', async () => {
    const { onFile } = renderPicker();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Choose image' })).toHaveFocus();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toHaveAttribute('accept', 'image/*');
    await userEvent.upload(input, image);
    expect(onFile).toHaveBeenCalledWith(image);
  });

  it('accepts an image dropped on the zone', () => {
    const { onFile, onInvalidFile } = renderPicker();
    drop(image);
    expect(onFile).toHaveBeenCalledWith(image);
    expect(onInvalidFile).not.toHaveBeenCalled();
  });

  it('marks the zone while a file is dragged over it', () => {
    renderPicker();
    fireEvent.dragOver(dropZone(), { dataTransfer: { files: [] } });
    expect(dropZone()).toHaveAttribute('data-dragging', 'true');
    fireEvent.dragLeave(dropZone());
    expect(dropZone()).toHaveAttribute('data-dragging', 'false');
  });

  it('rejects a file that is not an image', () => {
    const { onFile, onInvalidFile } = renderPicker();
    drop(text);
    expect(onInvalidFile).toHaveBeenCalledWith(text);
    expect(onFile).not.toHaveBeenCalled();
  });

  it('is busy and ignores new files while reading', () => {
    const { onFile } = renderPicker({ state: 'reading' });
    expect(dropZone()).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'Choose image' })).toBeDisabled();
    drop(image);
    expect(onFile).not.toHaveBeenCalled();
  });

  it('RNF-10 shows the error under the zone and announces it', () => {
    renderPicker({ state: 'error', error: 'No QR code in this image' });
    expect(screen.getByRole('alert')).toHaveTextContent('No QR code in this image');
    expect(screen.getByRole('button', { name: 'Choose image' })).toHaveAccessibleDescription(
      'No QR code in this image',
    );
  });

  it('RNF-10 has no axe violations in any state', async () => {
    renderWithTheme(
      <>
        <FilePicker
          label="Idle"
          hint="drop"
          state="idle"
          onFile={vi.fn()}
          onInvalidFile={vi.fn()}
        />
        <FilePicker
          label="Reading"
          hint="drop"
          state="reading"
          onFile={vi.fn()}
          onInvalidFile={vi.fn()}
        />
        <FilePicker
          label="Error"
          hint="drop"
          state="error"
          error="Not an image"
          onFile={vi.fn()}
          onInvalidFile={vi.fn()}
        />
      </>,
    );
    expect(await axeViolations()).toEqual([]);
  });
});
