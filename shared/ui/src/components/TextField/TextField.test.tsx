import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../testing';
import { renderWithTheme } from '../../testing/renderWithTheme';
import { TextArea, TextField } from './TextField';

const counter = (length: number, max: number) => `${length} of ${max}`;

function ControlledField({ multiline = false }: { multiline?: boolean }) {
  const [value, setValue] = useState('');
  const Field = multiline ? TextArea : TextField;
  return (
    <Field
      label="Nickname"
      value={value}
      onChange={setValue}
      maxLength={5}
      formatCounter={counter}
    />
  );
}

describe.each([
  ['TextField', false, 'Nickname'],
  ['TextArea', true, 'Nickname'],
])('F2-17 %s', (_name, multiline, label) => {
  it('reports the typed text and counts the characters', async () => {
    renderWithTheme(<ControlledField multiline={multiline} />);
    await userEvent.type(screen.getByRole('textbox', { name: label }), 'Rei');
    expect(screen.getByRole('textbox', { name: label })).toHaveValue('Rei');
    expect(screen.getByText('3 of 5')).toBeInTheDocument();
  });

  it('stops at the maximum length', async () => {
    renderWithTheme(<ControlledField multiline={multiline} />);
    await userEvent.type(screen.getByRole('textbox', { name: label }), 'Vitality');
    expect(screen.getByRole('textbox', { name: label })).toHaveValue('Vital');
  });
});

describe('F2-17 TextField and TextArea errors', () => {
  it.each([
    ['TextField', TextField],
    ['TextArea', TextArea],
  ] as const)('RNF-10 %s shows the error under the field and announces it', (_name, Field) => {
    renderWithTheme(<Field label="Nickname" value="" onChange={vi.fn()} error="Required" />);
    const field = screen.getByRole('textbox', { name: 'Nickname' });
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAccessibleDescription('Required');
  });

  it('has no counter without a formatter', () => {
    renderWithTheme(<TextField label="Search" value="abc" onChange={vi.fn()} />);
    expect(screen.queryByText(/3/)).not.toBeInTheDocument();
  });

  it('RNF-10 has no axe violations', async () => {
    renderWithTheme(
      <>
        <TextField
          label="Nickname"
          value="Rei"
          onChange={vi.fn()}
          maxLength={5}
          formatCounter={counter}
        />
        <TextArea label="Note" value="" onChange={vi.fn()} error="Required" />
      </>,
    );
    expect(await axeViolations()).toEqual([]);
  });
});
