import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../testing';
import { renderWithTheme } from '../../testing/renderWithTheme';
import { WeekStrip, type WeekStripDay } from './WeekStrip';

const NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS: WeekStripDay[] = NAMES.map((dayName, index) => ({
  dayName,
  score: index < 3 ? 60 + index : null,
  band: index < 3 ? 'solidBase' : null,
}));

function renderStrip(todayIndex: number | null, onSelectDay = vi.fn()) {
  renderWithTheme(
    <WeekStrip
      label="Days of the week"
      days={DAYS}
      todayIndex={todayIndex}
      missingLabel="Not logged"
      todayLabel="Today"
      onSelectDay={onSelectDay}
    />,
  );
  return onSelectDay;
}

describe('F2-18 WeekStrip', () => {
  it('RF-08 lists the seven days from Monday to Sunday', () => {
    renderStrip(2);
    const list = screen.getByRole('list', { name: 'Days of the week' });
    const names = within(list)
      .getAllByRole('button')
      .map((tile) => tile.textContent?.slice(0, 3));
    expect(names).toEqual(NAMES);
  });

  it('RF-08 highlights today and only today', () => {
    renderStrip(2);
    const highlighted = screen
      .getAllByRole('button')
      .filter((tile) => tile.getAttribute('data-accent') === 'primary');
    expect(highlighted).toHaveLength(1);
    expect(highlighted[0]).toHaveAccessibleName('Wed 62 Today');
    expect(screen.getAllByText('Today')).toHaveLength(1);
  });

  it('highlights no day when today is outside the week shown', () => {
    renderStrip(null);
    expect(screen.queryByText('Today')).not.toBeInTheDocument();
  });

  it('RF-08 reports the index of the day the user opens', async () => {
    const onSelectDay = renderStrip(2);
    await userEvent.click(screen.getByRole('button', { name: 'Fri Not logged' }));
    expect(onSelectDay).toHaveBeenCalledWith(4);
  });

  it('RNF-10 has no axe violations', async () => {
    renderStrip(0);
    expect(await axeViolations()).toEqual([]);
  });
});
