import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../../testing/renderWithTheme';
import { AppShell } from './AppShell';

const items = (onSelect = vi.fn()) => [
  { id: 'today', label: 'Today', icon: 'today' as const, active: true, onSelect },
  { id: 'week', label: 'Week', icon: 'week' as const, active: false, onSelect },
];

describe('AppShell (provisional, F1-01)', () => {
  it('renders a labelled navigation landmark with one button per item', () => {
    renderWithTheme(
      <AppShell navLabel="Main" navItems={items()}>
        <p>content</p>
      </AppShell>,
    );
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(nav).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(2);
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('marks the active item as the current page', () => {
    renderWithTheme(
      <AppShell navLabel="Main" navItems={items()}>
        {null}
      </AppShell>,
    );
    expect(screen.getByRole('button', { name: 'Today' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Week' })).not.toHaveAttribute('aria-current');
  });

  it('calls onSelect when an item is clicked', async () => {
    const onSelect = vi.fn();
    renderWithTheme(
      <AppShell navLabel="Main" navItems={items(onSelect)}>
        {null}
      </AppShell>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Week' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('shows the banner slot above the content', () => {
    renderWithTheme(
      <AppShell navLabel="Main" navItems={items()} banner={<div role="status">banner</div>}>
        {null}
      </AppShell>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('banner');
  });
});
