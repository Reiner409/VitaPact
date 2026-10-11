import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../testing';
import { renderWithTheme } from '../../testing/renderWithTheme';
import { ScaleInput, type ScaleValue } from './ScaleInput';

const valueLabel = (value: number) => `${value} of 5`;

function Controlled({
  initial = null,
  onValue,
}: {
  initial?: ScaleValue | null;
  onValue: (v: ScaleValue) => void;
}) {
  const [value, setValue] = useState<ScaleValue | null>(initial);
  return (
    <ScaleInput
      label="Energy"
      getValueLabel={valueLabel}
      value={value}
      onChange={(next) => {
        setValue(next);
        onValue(next);
      }}
    />
  );
}

function renderScale(initial: ScaleValue | null = null) {
  const onValue = vi.fn();
  renderWithTheme(<Controlled initial={initial} onValue={onValue} />);
  return onValue;
}

const dot = (value: number) => screen.getByRole('radio', { name: valueLabel(value) });

describe('F2-17 ScaleInput', () => {
  it('is a labelled group of five dots, none selected when empty', () => {
    renderScale();
    expect(screen.getByRole('radiogroup', { name: 'Energy' })).toBeInTheDocument();
    const dots = screen.getAllByRole('radio');
    expect(dots).toHaveLength(5);
    for (const each of dots) expect(each).not.toBeChecked();
  });

  it('selects a dot with a click', async () => {
    const onValue = renderScale();
    await userEvent.click(dot(4));
    expect(onValue).toHaveBeenLastCalledWith(4);
    expect(dot(4)).toBeChecked();
  });

  it('RNF-10 is reached with Tab on the first dot when empty, on the selected one otherwise', async () => {
    renderScale(3);
    await userEvent.tab();
    expect(dot(3)).toHaveFocus();
  });

  it('RNF-10 is reached with Tab on the first dot when empty', async () => {
    renderScale();
    await userEvent.tab();
    expect(dot(1)).toHaveFocus();
  });

  it('RNF-10 moves and selects with the arrow keys', async () => {
    const onValue = renderScale(3);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    expect(onValue).toHaveBeenLastCalledWith(4);
    expect(dot(4)).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(onValue).toHaveBeenLastCalledWith(2);
    await userEvent.keyboard('{ArrowUp}');
    expect(onValue).toHaveBeenLastCalledWith(3);
    await userEvent.keyboard('{ArrowDown}');
    expect(onValue).toHaveBeenLastCalledWith(2);
  });

  it('RNF-10 stops at 1 and 5, and jumps there with Home and End', async () => {
    const onValue = renderScale(5);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    expect(onValue).not.toHaveBeenCalled();
    await userEvent.keyboard('{Home}');
    expect(onValue).toHaveBeenLastCalledWith(1);
    await userEvent.keyboard('{ArrowLeft}');
    expect(onValue).toHaveBeenCalledTimes(1);
    await userEvent.keyboard('{End}');
    expect(onValue).toHaveBeenLastCalledWith(5);
  });

  it('RNF-10 selects the focused dot with Space when empty', async () => {
    const onValue = renderScale();
    await userEvent.tab();
    await userEvent.keyboard(' ');
    expect(onValue).toHaveBeenLastCalledWith(1);
  });

  it('RNF-10 every dot keeps a 44 px target', () => {
    renderScale();
    for (const each of screen.getAllByRole('radio')) {
      expect(each).toHaveStyle({ minWidth: '44px', minHeight: '44px' });
    }
  });

  it('RNF-10 has no axe violations, empty and selected', async () => {
    renderWithTheme(
      <>
        <ScaleInput label="Energy" getValueLabel={valueLabel} value={null} onChange={vi.fn()} />
        <ScaleInput label="Mood" getValueLabel={valueLabel} value={2} onChange={vi.fn()} />
      </>,
    );
    expect(await axeViolations()).toEqual([]);
  });
});
