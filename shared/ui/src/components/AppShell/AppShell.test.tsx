import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axeViolations, setViewportWidth } from '../../testing';
import { renderWithTheme } from '../../testing/renderWithTheme';
import { AppShell } from './AppShell';

const items = (onSelect = vi.fn()) => [
  { id: 'today', label: 'Today', icon: 'today' as const, active: true, onSelect },
  { id: 'week', label: 'Week', icon: 'week' as const, active: false, onSelect },
];

function renderShell(onSelect = vi.fn()) {
  return renderWithTheme(
    <AppShell navLabel="Main" navItems={items(onSelect)} banner={<div role="status">banner</div>}>
      <p>content</p>
    </AppShell>,
  );
}

describe('F2-16 AppShell', () => {
  beforeEach(() => setViewportWidth(1024));

  it('renders a labelled navigation landmark with one button per item and the content', () => {
    renderShell();
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(within(nav).getAllByRole('button')).toHaveLength(2);
    expect(within(screen.getByRole('main')).getByText('content')).toBeInTheDocument();
  });

  it('marks the active item as the current page', () => {
    renderShell();
    expect(screen.getByRole('button', { name: 'Today' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Week' })).not.toHaveAttribute('aria-current');
  });

  it('RNF-10 reaches every item with the keyboard and selects it with Enter', async () => {
    const onSelect = vi.fn();
    renderShell(onSelect);
    await userEvent.tab();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Week' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('shows the banner slot above the content', () => {
    renderShell();
    const banner = screen.getByRole('status');
    const content = screen.getByText('content');
    expect(banner.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('RNF-10 has no axe violations', async () => {
    renderShell();
    expect(await axeViolations()).toEqual([]);
  });
});

describe('F2-16 RF-29 AppShell adapts to the window width', () => {
  it.each([
    [360, 'bottomBar'],
    [767, 'bottomBar'],
    [768, 'sidebar'],
    [1024, 'sidebar'],
  ])('at %d px the navigation is the %s', (width, placement) => {
    setViewportWidth(width);
    renderShell();
    expect(screen.getByRole('navigation', { name: 'Main' })).toHaveAttribute(
      'data-placement',
      placement,
    );
  });

  it.each([360, 1024])('at %d px every item keeps a 44 px target', (width) => {
    setViewportWidth(width);
    renderShell();
    for (const button of screen.getAllByRole('button')) {
      expect(button).toHaveStyle({ minHeight: '44px', minWidth: '44px' });
    }
  });
});
