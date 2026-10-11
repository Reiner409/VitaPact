import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../testing';
import { renderWithTheme } from '../../testing/renderWithTheme';
import { DayTile, type DayTileProps } from './DayTile';

const base: DayTileProps = {
  dayName: 'Wed',
  score: 72,
  band: 'onIt',
  missingLabel: 'Not logged',
  todayLabel: 'Today',
  onClick: vi.fn(),
};

describe('F2-18 DayTile', () => {
  it("RF-08 is a button named by the day and its score, with the band's dot", () => {
    renderWithTheme(<DayTile {...base} />);
    const tile = screen.getByRole('button', { name: 'Wed 72' });
    expect(tile.querySelector('[data-band="onIt"]')).not.toBeNull();
    expect(tile).toHaveStyle({ minHeight: '44px' });
  });

  it('RF-08 shows an empty dot and the missing label for a day not logged', () => {
    renderWithTheme(<DayTile {...base} score={null} band={null} />);
    const tile = screen.getByRole('button', { name: 'Wed Not logged' });
    expect(tile.querySelector('[data-band="none"]')).not.toBeNull();
  });

  it('RF-08 opens the day when clicked or chosen with the keyboard', async () => {
    const onClick = vi.fn();
    renderWithTheme(<DayTile {...base} onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('marks today with the primary border and the today label', () => {
    renderWithTheme(<DayTile {...base} today />);
    const tile = screen.getByRole('button', { name: 'Wed 72 Today' });
    expect(tile).toHaveAttribute('data-accent', 'primary');
  });

  it('other days carry no accent', () => {
    renderWithTheme(<DayTile {...base} />);
    expect(screen.getByRole('button')).not.toHaveAttribute('data-accent');
  });

  it('RNF-10 has no axe violations', async () => {
    renderWithTheme(<DayTile {...base} today />);
    expect(await axeViolations()).toEqual([]);
  });
});
