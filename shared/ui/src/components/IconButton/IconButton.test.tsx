import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../testing';
import { renderWithTheme } from '../../testing/renderWithTheme';
import { IconButton } from './IconButton';

describe('F2-16 IconButton', () => {
  it.each(['subtle', 'outline'] as const)(
    'renders the %s variant named by its label, with a 44 px target',
    (variant) => {
      renderWithTheme(<IconButton icon="settings" label="Settings" variant={variant} />);
      const button = screen.getByRole('button', { name: 'Settings' });
      expect(button).toHaveAttribute('data-variant', variant);
      expect(button).toHaveStyle({ minWidth: '44px', minHeight: '44px' });
    },
  );

  it('RNF-10 is activated with the keyboard', async () => {
    const onClick = vi.fn();
    renderWithTheme(<IconButton icon="settings" label="Settings" onClick={onClick} />);
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does nothing while disabled', async () => {
    const onClick = vi.fn();
    renderWithTheme(<IconButton icon="settings" label="Settings" onClick={onClick} disabled />);
    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('RNF-10 has no axe violations', async () => {
    renderWithTheme(<IconButton icon="settings" label="Settings" />);
    expect(await axeViolations()).toEqual([]);
  });
});
