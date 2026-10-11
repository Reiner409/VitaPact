import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../testing';
import { renderWithTheme } from '../../testing/renderWithTheme';
import { ChipGroup } from './ChipGroup';

const options = [
  { value: 'strength', label: 'Strength' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'mobility', label: 'Mobility' },
];

function Single({ onValue }: { onValue: (v: string) => void }) {
  const [value, setValue] = useState<string | null>(null);
  return (
    <ChipGroup
      label="Training type"
      options={options}
      value={value}
      onChange={(next) => {
        setValue(next);
        onValue(next);
      }}
    />
  );
}

function Multiple({ onValue }: { onValue: (v: string[]) => void }) {
  const [value, setValue] = useState<string[]>([]);
  return (
    <ChipGroup
      multiple
      label="Tags"
      options={options}
      value={value}
      onChange={(next) => {
        setValue(next);
        onValue(next);
      }}
    />
  );
}

describe('F2-17 ChipGroup, single', () => {
  it('is a labelled radio group with one option per chip', () => {
    renderWithTheme(<Single onValue={vi.fn()} />);
    expect(screen.getByRole('radiogroup', { name: 'Training type' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('keeps only the last choice', async () => {
    const onValue = vi.fn();
    renderWithTheme(<Single onValue={onValue} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Strength' }));
    await userEvent.click(screen.getByRole('radio', { name: 'Cardio' }));
    expect(onValue).toHaveBeenLastCalledWith('cardio');
    expect(screen.getByRole('radio', { name: 'Strength' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Cardio' })).toBeChecked();
  });

  it('RNF-10 selects with the keyboard', async () => {
    const onValue = vi.fn();
    renderWithTheme(<Single onValue={onValue} />);
    await userEvent.tab();
    await userEvent.keyboard(' ');
    expect(onValue).toHaveBeenLastCalledWith('strength');
  });
});

describe('F2-17 ChipGroup, multiple', () => {
  it('is a labelled group of checkboxes', () => {
    renderWithTheme(<Multiple onValue={vi.fn()} />);
    expect(screen.getByRole('group', { name: 'Tags' })).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
  });

  it('adds and removes choices', async () => {
    const onValue = vi.fn();
    renderWithTheme(<Multiple onValue={onValue} />);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Strength' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'Mobility' }));
    expect(onValue).toHaveBeenLastCalledWith(['strength', 'mobility']);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Strength' }));
    expect(onValue).toHaveBeenLastCalledWith(['mobility']);
  });

  it('RNF-10 toggles with the keyboard', async () => {
    const onValue = vi.fn();
    renderWithTheme(<Multiple onValue={onValue} />);
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.keyboard(' ');
    expect(onValue).toHaveBeenLastCalledWith(['cardio']);
  });

  it('RNF-10 has no axe violations in either mode', async () => {
    renderWithTheme(
      <>
        <Single onValue={vi.fn()} />
        <Multiple onValue={vi.fn()} />
      </>,
    );
    expect(await axeViolations()).toEqual([]);
  });
});
