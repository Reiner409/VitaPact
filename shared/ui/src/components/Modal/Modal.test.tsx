import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../testing';
import { renderWithTheme } from '../../testing/renderWithTheme';
import { Modal, type ModalSize } from './Modal';

function renderModal({ opened = true, onClose = vi.fn(), size = 'small' as ModalSize } = {}) {
  return renderWithTheme(
    <Modal opened={opened} onClose={onClose} title="New group" closeLabel="Close" size={size}>
      <input aria-label="Name" />
    </Modal>,
  );
}

describe('F2-16 Modal', () => {
  it('is a dialog named by its title', async () => {
    renderModal();
    expect(await screen.findByRole('dialog', { name: 'New group' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument();
  });

  it('renders nothing while closed', () => {
    renderModal({ opened: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it.each([
    ['small', 'sm'],
    ['medium', 'lg'],
  ] as const)('the %s size is drawn at the matching width', async (size, mantineSize) => {
    renderModal({ size });
    const dialog = await screen.findByRole('dialog');
    expect(dialog.closest('.mantine-Modal-root')).toHaveStyle({
      '--modal-size': `var(--modal-size-${mantineSize})`,
    });
  });

  it('RNF-10 closes with Escape and with the labelled close button', async () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('RNF-10 has no axe violations', async () => {
    renderModal();
    await screen.findByRole('dialog');
    expect(await axeViolations()).toEqual([]);
  });
});
