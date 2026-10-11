import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../testing';
import { renderWithTheme } from '../../testing/renderWithTheme';
import { PillarCard, type PillarCardProps } from './PillarCard';
import type { PillarCardText } from './PillarField';
import type { PillarCardPillar, PillarCardValues } from './pillarShape';

// The pillars of core's pillar module (F2-05), hydration being the one that exists only in tests.
const sleep: PillarCardPillar = {
  id: 'sleep',
  color: 'sleep',
  icon: 'sleep',
  fields: [
    { kind: 'number', key: 'hours', unit: 'hours', min: 0, max: 24 },
    { kind: 'scale', key: 'quality', min: 1, max: 5 },
  ],
};
const training: PillarCardPillar = {
  id: 'training',
  color: 'training',
  icon: 'training',
  fields: [
    { kind: 'yesNo', key: 'trained' },
    {
      kind: 'choice',
      key: 'type',
      options: ['gym', 'running', 'cycling', 'swimming', 'teamSports', 'other'],
      askedWhen: { key: 'trained', equals: true },
    },
    {
      kind: 'number',
      key: 'minutes',
      unit: 'minutes',
      min: 0,
      max: 1440,
      askedWhen: { key: 'trained', equals: true },
    },
  ],
};
const food: PillarCardPillar = {
  id: 'food',
  color: 'food',
  icon: 'food',
  fields: [{ kind: 'scale', key: 'rating', min: 1, max: 5 }],
};
const sun: PillarCardPillar = {
  id: 'sun',
  color: 'sun',
  icon: 'sun',
  fields: [{ kind: 'number', key: 'minutes', unit: 'minutes', min: 0, max: 1440 }],
};
const hydration: PillarCardPillar = {
  id: 'hydration',
  color: 'hydration',
  icon: 'hydration',
  fields: [{ kind: 'number', key: 'litres', unit: 'litres', min: 0, max: 10 }],
};

const capitalised = (key: string) => key.charAt(0).toUpperCase() + key.slice(1);

const text: PillarCardText = {
  fieldLabel: capitalised,
  unitLabel: (unit) => unit.slice(0, 3),
  optionLabel: (_field, option) => capitalised(option),
  scaleValueLabel: (field, value) => `${field} ${value} of 5`,
  yes: 'Yes',
  no: 'No',
};

function StatefulCard(props: Omit<PillarCardProps, 'values' | 'onChange' | 'text'>) {
  const [values, setValues] = useState<PillarCardValues>({});
  return (
    <PillarCard
      {...props}
      text={text}
      values={values}
      onChange={(field, value) => setValues((current) => ({ ...current, [field]: value }))}
    />
  );
}

const card = (name: string) => screen.getByRole('region', { name });
const accentOf = (name: string) => card(name).parentElement?.getAttribute('data-accent');

describe('F2-18 PillarCard', () => {
  it('RF-03 RF-23 asks the sleep hours and the quality from the sleep module', () => {
    renderWithTheme(<StatefulCard pillar={sleep} title="Sleep" />);
    expect(accentOf('Sleep')).toBe('sleep');
    expect(screen.getByRole('textbox', { name: 'Hours' })).toBeInTheDocument();
    expect(screen.getByRole('radiogroup', { name: 'Quality' })).toBeInTheDocument();
  });

  it('RF-03 RF-23 asks the workout type and minutes only after a yes', async () => {
    renderWithTheme(<StatefulCard pillar={training} title="Training" />);
    expect(screen.getByRole('group', { name: 'Trained' })).toBeInTheDocument();
    expect(screen.queryByRole('radiogroup', { name: 'Type' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Yes' }));
    expect(screen.getByRole('radio', { name: 'TeamSports' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Minutes' })).toBeInTheDocument();
  });

  it('RF-03 RF-23 rates clean eating on the 1-5 scale of the food module', () => {
    renderWithTheme(<StatefulCard pillar={food} title="Eating" />);
    expect(accentOf('Eating')).toBe('food');
    expect(screen.getAllByRole('radio', { name: /^rating \d of 5$/ })).toHaveLength(5);
  });

  it('RF-03 RF-23 asks the minutes in the sun from the sun module', () => {
    renderWithTheme(<StatefulCard pillar={sun} title="Sun" />);
    expect(accentOf('Sun')).toBe('sun');
    expect(screen.getByRole('textbox', { name: 'Minutes' })).toBeInTheDocument();
  });

  it('RF-23 shows the test pillar with no change to the card', async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <PillarCard
        pillar={hydration}
        title="Hydration"
        text={text}
        values={{}}
        onChange={onChange}
      />,
    );
    expect(accentOf('Hydration')).toBe('primary');
    expect(card('Hydration').querySelector('[data-icon="pillar"]')).not.toBeNull();
    await userEvent.type(screen.getByRole('textbox', { name: 'Litres' }), '2');
    expect(onChange).toHaveBeenLastCalledWith('litres', 2);
  });

  it('RF-03 reports each change with the field key', async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <PillarCard pillar={sleep} title="Sleep" text={text} values={{}} onChange={onChange} />,
    );
    await userEvent.click(screen.getByRole('radio', { name: 'quality 4 of 5' }));
    expect(onChange).toHaveBeenCalledWith('quality', 4);
  });

  it('shows the error of a field under it', () => {
    renderWithTheme(
      <PillarCard
        pillar={sun}
        title="Sun"
        text={text}
        values={{ minutes: 2000 }}
        errors={{ minutes: 'At most 1440 minutes' }}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('At most 1440 minutes');
  });

  it('G4.2 colours the icon with the pillar, and the title stays in the text colour', () => {
    renderWithTheme(<StatefulCard pillar={sleep} title="Sleep" />);
    expect(document.querySelector('[data-icon="sleep"]')?.parentElement).toHaveStyle({
      color: 'var(--vp-color-pillar-sleep)',
    });
    expect(screen.getByRole('heading', { name: 'Sleep' })).not.toHaveAttribute('style', /pillar/);
  });

  it('turns green with its message once the goal is reached', () => {
    renderWithTheme(<StatefulCard pillar={sun} title="Sun" goalReachedLabel="Goal reached" />);
    expect(screen.getByText('Goal reached')).toBeInTheDocument();
    expect(card('Sun').parentElement).toHaveStyle({
      backgroundColor: 'var(--vp-color-primary-soft)',
    });
  });

  it('RNF-10 has no axe violations', async () => {
    renderWithTheme(<StatefulCard pillar={training} title="Training" goalReachedLabel="Done" />);
    expect(await axeViolations()).toEqual([]);
  });
});
