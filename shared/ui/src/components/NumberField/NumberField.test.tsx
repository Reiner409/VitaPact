import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../testing';
import { renderWithTheme } from '../../testing/renderWithTheme';
import { NumberField, type NumberFieldProps, type NumberUnit } from './NumberField';

type Props = Omit<NumberFieldProps, 'value' | 'onChange'> & { initial?: number | null };

function Controlled({
  initial = null,
  onValue,
  ...props
}: Props & { onValue: (v: unknown) => void }) {
  const [value, setValue] = useState<number | null>(initial);
  return (
    <NumberField
      {...props}
      value={value}
      onChange={(next) => {
        setValue(next);
        onValue(next);
      }}
    />
  );
}

function renderField(props: Partial<Props> & { unit: NumberUnit }) {
  const onValue = vi.fn();
  renderWithTheme(<Controlled label="Sleep" unitLabel="h" onValue={onValue} {...props} />);
  return { field: screen.getByRole('textbox', { name: 'Sleep' }), onValue };
}

describe('F2-17 NumberField steps', () => {
  it.each([
    ['hours', 7, 7.5, 'ArrowUp'],
    ['hours', 7, 6.5, 'ArrowDown'],
    ['minutes', 30, 35, 'ArrowUp'],
    ['minutes', 30, 25, 'ArrowDown'],
    ['kg', 72.3, 72.4, 'ArrowUp'],
    ['kg', 72.3, 72.2, 'ArrowDown'],
  ] as const)('%s: from %d the %s key gives %d', async (unit, initial, expected, key) => {
    const { field, onValue } = renderField({ unit, initial });
    await userEvent.click(field);
    await userEvent.keyboard(`{${key}}`);
    expect(onValue).toHaveBeenLastCalledWith(expected);
  });

  it('kg steps do not drift after many presses', async () => {
    const { field, onValue } = renderField({ unit: 'kg', initial: 70 });
    await userEvent.click(field);
    for (let press = 0; press < 7; press += 1) await userEvent.keyboard('{ArrowUp}');
    expect(onValue).toHaveBeenLastCalledWith(70.7);
  });

  it('RF-23 a step override sets the step and the decimals, e.g. litres by 0.25', async () => {
    const { field, onValue } = renderField({ unit: 'hours', step: 0.25, initial: 2 });
    await userEvent.click(field);
    await userEvent.keyboard('{ArrowUp}');
    expect(onValue).toHaveBeenLastCalledWith(2.25);
    await userEvent.clear(field);
    await userEvent.type(field, '1.75');
    expect(onValue).toHaveBeenLastCalledWith(1.75);
  });
});

describe('F2-17 NumberField limits', () => {
  it('stops at the maximum with the keyboard', async () => {
    const { field, onValue } = renderField({ unit: 'hours', initial: 23.5, max: 24 });
    await userEvent.click(field);
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    expect(onValue).toHaveBeenLastCalledWith(24);
  });

  it('stops at the minimum with the keyboard', async () => {
    const { field, onValue } = renderField({ unit: 'minutes', initial: 5, min: 0 });
    await userEvent.click(field);
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(onValue).toHaveBeenLastCalledWith(0);
  });

  it('keeps a typed value above the maximum so the screen can flag it', async () => {
    const { field, onValue } = renderField({ unit: 'hours', max: 24 });
    await userEvent.type(field, '99');
    await userEvent.tab();
    expect(field).toHaveValue('99');
    expect(onValue).toHaveBeenLastCalledWith(99);
    expect(onValue).not.toHaveBeenCalledWith(24);
  });

  it('reports an emptied field as null', async () => {
    const { field, onValue } = renderField({ unit: 'kg', initial: 70 });
    await userEvent.clear(field);
    expect(onValue).toHaveBeenLastCalledWith(null);
  });
});

describe('F2-17 NumberField presentation', () => {
  it('shows the unit next to the number', () => {
    renderField({ unit: 'hours', initial: 7 });
    expect(screen.getByText('h')).toBeInTheDocument();
  });

  it('RNF-10 shows the error under the field and announces it', () => {
    const { field } = renderField({ unit: 'kg', error: 'Enter your weight' });
    expect(screen.getByRole('alert')).toHaveTextContent('Enter your weight');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAccessibleDescription('Enter your weight');
  });

  it('RNF-10 has no axe violations, with and without an error', async () => {
    renderWithTheme(
      <>
        <NumberField label="Sleep" unit="hours" unitLabel="h" value={7} onChange={vi.fn()} />
        <NumberField
          label="Weight"
          unit="kg"
          unitLabel="kg"
          value={null}
          onChange={vi.fn()}
          error="Enter your weight"
        />
      </>,
    );
    expect(await axeViolations()).toEqual([]);
  });
});
