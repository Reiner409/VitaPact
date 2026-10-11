import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../testing';
import { renderWithTheme } from '../../testing/renderWithTheme';
import { Button, type ButtonVariant } from './Button';

const variants: ButtonVariant[] = ['primary', 'secondary', 'subtle', 'destructive'];

describe('F2-16 Button', () => {
  it.each(variants)('renders the %s variant with its label and a 44 px target', (variant) => {
    renderWithTheme(<Button variant={variant}>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveAttribute('data-variant', variant);
    expect(button).toHaveStyle({ minHeight: '44px' });
  });

  it('RNF-10 is activated with the keyboard', async () => {
    const onClick = vi.fn();
    renderWithTheme(<Button onClick={onClick}>Save</Button>);
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('does nothing while disabled', async () => {
    const onClick = vi.fn();
    renderWithTheme(
      <Button onClick={onClick} disabled>
        Save
      </Button>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('is busy and does nothing while loading', async () => {
    const onClick = vi.fn();
    renderWithTheme(
      <Button onClick={onClick} loading>
        Save
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Save' });
    await userEvent.click(button);
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(onClick).not.toHaveBeenCalled();
  });

  it('submits a form when its type is submit', async () => {
    const onSubmit = vi.fn((event: Event) => event.preventDefault());
    renderWithTheme(
      <form onSubmit={(event) => onSubmit(event.nativeEvent)}>
        <Button type="submit">Save</Button>
      </form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('shows the icon before the label, hidden from screen readers', () => {
    renderWithTheme(<Button icon="weighIn">Weigh in</Button>);
    const button = screen.getByRole('button', { name: 'Weigh in' });
    expect(button.querySelector('[data-icon="weighIn"]')).toHaveAttribute('aria-hidden', 'true');
  });

  it('RNF-10 has no axe violations in any variant or state', async () => {
    renderWithTheme(
      <>
        {variants.map((variant) => (
          <Button key={variant} variant={variant}>
            {variant}
          </Button>
        ))}
        <Button disabled>Disabled</Button>
        <Button loading>Loading</Button>
      </>,
    );
    expect(await axeViolations()).toEqual([]);
  });
});
