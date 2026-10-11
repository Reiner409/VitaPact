import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../testing';
import { renderWithTheme } from '../../testing/renderWithTheme';
import { Card } from './Card';

describe('F2-16 Card', () => {
  it('renders its content in a plain container by default', () => {
    renderWithTheme(<Card>Sleep</Card>);
    expect(screen.getByText('Sleep')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('draws the highlighted variant with a coloured left border', () => {
    renderWithTheme(<Card accent="sleep">Sleep</Card>);
    const card = screen.getByText('Sleep');
    expect(card).toHaveAttribute('data-accent', 'sleep');
    expect(card.style.borderLeft).toBe('4px solid var(--vp-color-pillar-sleep)');
  });

  it('uses the light green background for the soft tone', () => {
    renderWithTheme(<Card tone="soft">Weekend</Card>);
    expect(screen.getByText('Weekend')).toHaveStyle({
      backgroundColor: 'var(--vp-color-primary-soft)',
    });
  });

  it('RNF-10 becomes a keyboard-reachable button when clickable', async () => {
    const onClick = vi.fn();
    renderWithTheme(<Card onClick={onClick}>Monday</Card>);
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Monday' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('RNF-10 has no axe violations in any variant', async () => {
    renderWithTheme(
      <>
        <Card>Plain</Card>
        <Card accent="primary">Highlighted</Card>
        <Card onClick={vi.fn()}>Clickable</Card>
      </>,
    );
    expect(await axeViolations()).toEqual([]);
  });
});
