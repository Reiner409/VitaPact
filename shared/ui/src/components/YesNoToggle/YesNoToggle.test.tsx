import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../testing';
import { renderWithTheme } from '../../testing/renderWithTheme';
import { YesNoToggle } from './YesNoToggle';

function renderToggle(value: boolean | null, onChange = vi.fn()) {
  renderWithTheme(
    <YesNoToggle
      label="Sun before 10"
      yesLabel="Yes"
      noLabel="No"
      value={value}
      onChange={onChange}
    />,
  );
  return onChange;
}

const yes = () => screen.getByRole('button', { name: 'Yes' });
const no = () => screen.getByRole('button', { name: 'No' });

describe('F2-17 YesNoToggle', () => {
  it('is a labelled group of two buttons', () => {
    renderToggle(null);
    expect(screen.getByRole('group', { name: 'Sun before 10' })).toBeInTheDocument();
  });

  it.each([
    [null, 'false', 'false'],
    [true, 'true', 'false'],
    [false, 'false', 'true'],
  ] as const)('when the value is %s, yes is pressed=%s and no is pressed=%s', (value, y, n) => {
    renderToggle(value);
    expect(yes()).toHaveAttribute('aria-pressed', y);
    expect(no()).toHaveAttribute('aria-pressed', n);
  });

  it('reports the choice', async () => {
    const onChange = renderToggle(null);
    await userEvent.click(yes());
    await userEvent.click(no());
    expect(onChange.mock.calls).toEqual([[true], [false]]);
  });

  it('RNF-10 is used with the keyboard and keeps 44 px targets', async () => {
    const onChange = renderToggle(null);
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(false);
    for (const button of [yes(), no()]) expect(button).toHaveStyle({ minHeight: '44px' });
  });

  it('RNF-10 has no axe violations', async () => {
    renderToggle(true);
    expect(await axeViolations()).toEqual([]);
  });
});
