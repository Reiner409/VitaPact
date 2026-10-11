import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../testing';
import { renderWithTheme } from '../../testing/renderWithTheme';
import { EmptyState } from './EmptyState';

describe('F2-16 EmptyState', () => {
  it('shows the icon, the phrase and the description without a button', () => {
    renderWithTheme(
      <EmptyState icon="friends" title="No friends yet" description="Add a report to start" />,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'No friends yet' })).toBeInTheDocument();
    expect(screen.getByText('Add a report to start')).toBeInTheDocument();
    expect(document.querySelector('[data-icon="friends"]')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('RNF-10 shows the action as a keyboard-reachable button', async () => {
    const onAction = vi.fn();
    renderWithTheme(
      <EmptyState
        icon="noteboard"
        title="No notes"
        action={{ label: 'New note', onClick: onAction }}
      />,
    );
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'New note' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('RNF-10 has no axe violations', async () => {
    renderWithTheme(
      <EmptyState icon="week" title="Empty" action={{ label: 'Start', onClick: vi.fn() }} />,
    );
    expect(await axeViolations()).toEqual([]);
  });
});
