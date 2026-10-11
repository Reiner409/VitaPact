import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../testing';
import { renderWithTheme } from '../../testing/renderWithTheme';
import { NavItem } from './NavItem';

describe('F2-16 NavItem', () => {
  it.each(['sidebar', 'bottomBar'] as const)(
    'in the %s it is a button named by its label with the icon hidden',
    (placement) => {
      renderWithTheme(
        <NavItem
          label="Week"
          icon="week"
          active={false}
          onSelect={vi.fn()}
          placement={placement}
        />,
      );
      const button = screen.getByRole('button', { name: 'Week' });
      expect(button.querySelector('[data-icon="week"]')).toHaveAttribute('aria-hidden', 'true');
    },
  );

  it('the active item has the base green background', () => {
    renderWithTheme(<NavItem label="Week" icon="week" active onSelect={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Week' })).toHaveStyle({
      backgroundColor: 'var(--vp-color-primary)',
    });
  });

  it('RNF-10 has no axe violations', async () => {
    renderWithTheme(<NavItem label="Week" icon="week" active onSelect={vi.fn()} />);
    expect(await axeViolations()).toEqual([]);
  });
});
