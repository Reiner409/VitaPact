import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../testing';
import { renderWithTheme } from '../../testing/renderWithTheme';
import { PasswordField } from './PasswordField';

const labels = { label: 'Password', showLabel: 'Show password', hideLabel: 'Hide password' };

function Controlled({ error }: { error?: string }) {
  const [value, setValue] = useState('');
  return (
    <PasswordField {...labels} value={value} onChange={setValue} {...(error ? { error } : {})} />
  );
}

const field = () => screen.getByLabelText('Password', { selector: 'input' });

describe('F2-17 PasswordField', () => {
  it('hides the password by default and reports what is typed', async () => {
    renderWithTheme(<Controlled />);
    await userEvent.type(field(), 'secret');
    expect(field()).toHaveAttribute('type', 'password');
    expect(field()).toHaveValue('secret');
  });

  it('RNF-10 shows and hides it with a keyboard-reachable, labelled button', async () => {
    renderWithTheme(<Controlled />);
    await userEvent.tab();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Show password' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(field()).toHaveAttribute('type', 'text');
    await userEvent.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(field()).toHaveAttribute('type', 'password');
  });

  it('RNF-10 the toggle keeps a 44 px target', () => {
    renderWithTheme(<Controlled />);
    expect(screen.getByRole('button', { name: 'Show password' })).toHaveStyle({
      minWidth: '44px',
      minHeight: '44px',
    });
  });

  it('RNF-10 shows the error under the field and announces it', () => {
    renderWithTheme(<Controlled error="Wrong password" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Wrong password');
    expect(field()).toHaveAttribute('aria-invalid', 'true');
    expect(field()).toHaveAccessibleDescription('Wrong password');
  });

  it('RNF-10 has no axe violations', async () => {
    renderWithTheme(
      <PasswordField {...labels} value="" onChange={vi.fn()} error="Wrong password" />,
    );
    expect(await axeViolations()).toEqual([]);
  });
});
