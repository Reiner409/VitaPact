import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../testing';
import { renderWithTheme } from '../../testing/renderWithTheme';
import { ConfirmDialog, type ConfirmDialogProps } from './ConfirmDialog';

const labels = {
  title: 'Delete all data?',
  message: 'This cannot be undone.',
  confirmLabel: 'Delete',
  cancelLabel: 'Cancel',
  closeLabel: 'Close',
};

function renderDialog(props: Partial<ConfirmDialogProps> = {}) {
  const handlers = { onConfirm: vi.fn(), onClose: vi.fn() };
  renderWithTheme(<ConfirmDialog opened {...labels} {...handlers} {...props} />);
  return handlers;
}

const confirmButton = () => screen.getByRole('button', { name: 'Delete' });

describe('F2-16 ConfirmDialog, simple', () => {
  it('shows the title, the message and both actions', async () => {
    renderDialog();
    expect(await screen.findByRole('dialog', { name: 'Delete all data?' })).toBeInTheDocument();
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(confirmButton()).toBeEnabled();
  });

  it('confirms and cancels', async () => {
    const { onConfirm, onClose } = renderDialog();
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('uses the destructive button for destructive actions', async () => {
    renderDialog({ destructive: true });
    expect(await screen.findByRole('button', { name: 'Delete' })).toHaveAttribute(
      'data-variant',
      'destructive',
    );
  });
});

describe('F2-16 ConfirmDialog, double', () => {
  const typedConfirmation = { word: 'DELETE', label: 'Type DELETE to confirm' };

  it('enables the confirm button only with the exact word', async () => {
    const { onConfirm } = renderDialog({ typedConfirmation });
    const field = await screen.findByRole('textbox', { name: 'Type DELETE to confirm' });
    expect(confirmButton()).toBeDisabled();

    for (const almost of ['delete', 'DELET', ' DELETE', 'DELETE ', 'DELETED']) {
      await userEvent.clear(field);
      await userEvent.type(field, almost);
      expect(confirmButton()).toBeDisabled();
    }

    await userEvent.clear(field);
    await userEvent.type(field, 'DELETE');
    expect(confirmButton()).toBeEnabled();
    await userEvent.click(confirmButton());
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('starts empty again when reopened', async () => {
    const handlers = { onConfirm: vi.fn(), onClose: vi.fn() };
    const props = { ...labels, ...handlers, typedConfirmation };
    const { rerender } = renderWithTheme(<ConfirmDialog opened {...props} />);
    await userEvent.type(await screen.findByRole('textbox'), 'DELETE');
    rerender(<ConfirmDialog opened={false} {...props} />);
    rerender(<ConfirmDialog opened {...props} />);
    expect(await screen.findByRole('textbox')).toHaveValue('');
  });

  it('RNF-10 is completed with the keyboard alone', async () => {
    const { onConfirm } = renderDialog({ typedConfirmation });
    const field = await screen.findByRole('textbox');
    await userEvent.click(field);
    await userEvent.keyboard('DELETE');
    await userEvent.tab();
    await userEvent.tab();
    expect(confirmButton()).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('RNF-10 has no axe violations', async () => {
    renderDialog({ typedConfirmation, destructive: true });
    await screen.findByRole('dialog');
    expect(await axeViolations()).toEqual([]);
  });
});
