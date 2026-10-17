import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../testing';
import { renderWithTheme } from '../../testing/renderWithTheme';
import { RankingList, type RankingListRow } from './RankingList';

const rows: RankingListRow[] = [
  { id: 'a', position: 1, name: 'Ada', value: '81', details: ['On it', '-0.4 kg'] },
  { id: 'me', position: 2, name: 'Rei', you: true, value: '62', comeback: 'Comeback +28 points' },
  { id: 'b', position: null, name: '<script>alert(1)</script>', waiting: 'Waiting' },
];

const renderList = (list = rows) =>
  renderWithTheme(<RankingList label="This week" youLabel="You" rows={list} />);

describe('F2-19 RankingList', () => {
  it('RF-13 lists every member in order with their score and details', () => {
    renderList();
    const items = within(screen.getByRole('list', { name: 'This week' })).getAllByRole('listitem');
    expect(items.map((item) => item.textContent)).toEqual([
      '1Ada81On it-0.4 kg',
      '2ReiYou62Comeback +28 points',
      '<script>alert(1)</script>Waiting',
    ]);
  });

  it('RF-27 highlights the comeback row', () => {
    renderList();
    const comeback = screen.getByText('Comeback +28 points').closest('[data-accent]');
    expect(comeback).toHaveAttribute('data-accent', 'primary');
  });

  it('RNF-05 shows a nickname with markup as plain text', () => {
    renderList();
    expect(screen.getByText('<script>alert(1)</script>')).toBeInTheDocument();
    expect(document.querySelector('script')).toBeNull();
  });

  it('RF-13 opens a member from their row', async () => {
    const onSelect = vi.fn();
    renderList([{ ...rows[0]!, onSelect }]);
    await userEvent.click(screen.getByRole('button', { name: /Ada/ }));
    expect(onSelect).toHaveBeenCalled();
  });

  it('RNF-10 has no accessibility violations', async () => {
    const { container } = renderList();
    expect(await axeViolations(container)).toEqual([]);
  });
});
