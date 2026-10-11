import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../testing';
import { renderWithTheme } from '../../testing/renderWithTheme';
import { tokens } from '../../tokens';
import { Toast } from './Toast';

describe('F2-16 Toast', () => {
  it('announces a success politely and an error assertively', () => {
    renderWithTheme(
      <>
        <Toast opened tone="success" message="Saved" closeLabel="Close" onClose={vi.fn()} />
        <Toast opened tone="error" message="Not saved" closeLabel="Close" onClose={vi.fn()} />
      </>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Saved');
    expect(screen.getByRole('alert')).toHaveTextContent('Not saved');
  });

  it('renders nothing while closed', () => {
    renderWithTheme(
      <Toast opened={false} tone="success" message="Saved" closeLabel="Close" onClose={vi.fn()} />,
    );
    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
  });

  it('RNF-10 can be closed with its labelled button', async () => {
    const onClose = vi.fn();
    renderWithTheme(
      <Toast opened tone="success" message="Saved" closeLabel="Close" onClose={onClose} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('RNF-10 has no axe violations', async () => {
    renderWithTheme(
      <Toast opened tone="error" message="Not saved" closeLabel="Close" onClose={vi.fn()} />,
    );
    expect(await axeViolations()).toEqual([]);
  });
});

describe('F2-16 Toast disappears after 4 seconds', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('closes itself once the toast duration has passed', () => {
    const onClose = vi.fn();
    renderWithTheme(
      <Toast opened tone="success" message="Saved" closeLabel="Close" onClose={onClose} />,
    );
    act(() => vi.advanceTimersByTime(tokens.timing.toast - 1));
    expect(onClose).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close itself while closed', () => {
    const onClose = vi.fn();
    renderWithTheme(
      <Toast opened={false} tone="success" message="Saved" closeLabel="Close" onClose={onClose} />,
    );
    act(() => vi.advanceTimersByTime(tokens.timing.toast * 2));
    expect(onClose).not.toHaveBeenCalled();
  });
});
