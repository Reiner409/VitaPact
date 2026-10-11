import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../testing';
import { renderWithTheme } from '../../testing/renderWithTheme';
import { Select } from './Select';

const options = [
  { value: 'gym', label: 'Gym crew' },
  { value: 'family', label: 'Family' },
  { value: 'office', label: 'Office' },
];

describe('F2-17 Select', () => {
  beforeAll(() => {
    // jsdom has no layout, so it lacks the scrolling Mantine does while moving through options.
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('shows the chosen option', () => {
    renderWithTheme(<Select label="Group" options={options} value="family" onChange={vi.fn()} />);
    expect(screen.getByRole('combobox', { name: 'Group' })).toHaveValue('Family');
  });

  it('RNF-10 chooses an option with the keyboard', async () => {
    const onChange = vi.fn();
    renderWithTheme(<Select label="Group" options={options} value={null} onChange={onChange} />);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('family');
  });

  it('filters the options while typing when searchable', async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <Select label="Group" options={options} value={null} onChange={onChange} searchable />,
    );
    await userEvent.type(screen.getByRole('combobox', { name: 'Group' }), 'off');
    // The dropdown is still in its opening transition, which jsdom never finishes.
    const option = (name: string) => screen.queryByRole('option', { name, hidden: true });
    expect(option('Office')).toBeInTheDocument();
    expect(option('Family')).not.toBeInTheDocument();
    await userEvent.click(option('Office')!);
    expect(onChange).toHaveBeenLastCalledWith('office');
  });

  it('RNF-10 shows the error under the field and announces it', () => {
    renderWithTheme(
      <Select label="Group" options={options} value={null} onChange={vi.fn()} error="Choose one" />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Choose one');
    expect(screen.getByRole('combobox', { name: 'Group' })).toHaveAccessibleDescription(
      'Choose one',
    );
  });

  it('RNF-10 has no axe violations', async () => {
    renderWithTheme(
      <Select label="Group" options={options} value="gym" onChange={vi.fn()} searchable />,
    );
    expect(await axeViolations()).toEqual([]);
  });
});
