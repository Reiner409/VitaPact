import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { saveDailyEntry } from '@vitapact/core/storage';
import { openTestDatabase, sampleEntry, sampleProfile } from '@vitapact/core/storage/testing';
import { renderWithProviders } from '@vitapact/ui/testing';
import { describe, expect, it } from 'vitest';
import en from '../locales/en/today.json';
import { TodayScreen, type TodayScreenProps } from './TodayScreen';

const MONDAY = '2026-10-12';
const SUNDAY = '2026-10-18';

const withGoals = (goals: Partial<typeof sampleProfile.goals>) => ({
  ...sampleProfile,
  goals: { ...sampleProfile.goals, ...goals },
});

async function renderToday(props: Partial<TodayScreenProps> = {}) {
  const db = props.db ?? (await openTestDatabase());
  return renderWithProviders(
    <TodayScreen db={db} profile={sampleProfile} today={MONDAY} {...props} />,
    { translations: { today: en } },
  );
}

const card = (name: string) => within(screen.getByRole('region', { name }));

describe('F3-TD-01 day header', () => {
  it('shows the date, the ISO week and six days to Sunday on a Monday', async () => {
    await renderToday();
    expect(screen.getByRole('heading', { level: 1, name: 'Today' })).toBeInTheDocument();
    expect(screen.getByText('Monday, October 12 · Week 42 · 6 days to Sunday')).toBeInTheDocument();
  });

  it('says that Sunday is today on a Sunday', async () => {
    await renderToday({ today: SUNDAY });
    expect(screen.getByText(/Week 42 · Sunday is today$/)).toBeInTheDocument();
  });
});

describe('F3-TD-02 sleep card', () => {
  it('RF-03 asks the hours and a quality of five steps', async () => {
    await renderToday();
    expect(card('Sleep').getByRole('textbox', { name: 'Hours slept' })).toBeInTheDocument();
    expect(card('Sleep').getAllByRole('radio')).toHaveLength(5);
  });

  it('RF-03 turns green once the hours reach the goal of the profile', async () => {
    await renderToday({ profile: withGoals({ sleepHours: 8 }) });
    const hours = card('Sleep').getByRole('textbox', { name: 'Hours slept' });
    await userEvent.type(hours, '7.5');
    expect(card('Sleep').queryByText('Goal reached')).not.toBeInTheDocument();
    await userEvent.clear(hours);
    await userEvent.type(hours, '8');
    expect(card('Sleep').getByText('Goal reached')).toBeInTheDocument();
  });

  it('RF-03 explains hours that are not in steps of half an hour', async () => {
    await renderToday();
    await userEvent.type(card('Sleep').getByRole('textbox', { name: 'Hours slept' }), '7.3');
    expect(card('Sleep').getByRole('alert')).toHaveTextContent('Use steps of 0.5');
  });
});

describe('F3-TD-03 training card', () => {
  it('RF-03 asks the workout and its duration only after a yes', async () => {
    await renderToday();
    await userEvent.click(card('Training').getByRole('button', { name: 'No' }));
    expect(card('Training').queryByRole('radiogroup', { name: 'Workout' })).not.toBeInTheDocument();
    expect(card('Training').queryByRole('textbox', { name: 'Duration' })).not.toBeInTheDocument();
    await userEvent.click(card('Training').getByRole('button', { name: 'Yes' }));
    expect(card('Training').getByRole('radio', { name: 'Sport' })).toBeInTheDocument();
    expect(card('Training').getByRole('textbox', { name: 'Duration' })).toBeInTheDocument();
  });
});

describe('F3-TD-04 clean eating card', () => {
  it('RF-03 names each value from Disaster to Spotless', async () => {
    await renderToday();
    const names = card('Clean eating')
      .getAllByRole('radio')
      .map((dot) => dot.getAttribute('aria-label'));
    expect(names).toEqual(['Disaster', 'Messy', 'Decent', 'Clean', 'Spotless']);
  });

  it('RF-03 is rated from the keyboard', async () => {
    await renderToday();
    card('Clean eating').getByRole('radio', { name: 'Disaster' }).focus();
    await userEvent.keyboard('{End}');
    expect(card('Clean eating').getByRole('radio', { name: 'Spotless' })).toBeChecked();
    expect(card('Clean eating').getByText('Goal reached')).toBeInTheDocument();
  });
});

describe('F3-TD-05 sun card', () => {
  it('RF-03 reaches the goal with the minutes of the profile', async () => {
    await renderToday({ profile: withGoals({ sunMinutes: 30 }) });
    const minutes = card('Sun').getByRole('textbox', { name: 'Minutes in the sun' });
    await userEvent.type(minutes, '25');
    expect(card('Sun').queryByText('Goal reached')).not.toBeInTheDocument();
    await userEvent.clear(minutes);
    await userEvent.type(minutes, '30');
    expect(card('Sun').getByText('Goal reached')).toBeInTheDocument();
  });
});

describe('F3-TD-02 F3-TD-05 the saved day', () => {
  it('RF-03 shows the values already saved for the day', async () => {
    const db = await openTestDatabase();
    await saveDailyEntry(db, sampleEntry);
    await renderToday({ db, today: sampleEntry.date });
    await waitFor(() =>
      expect(card('Sleep').getByRole('textbox', { name: 'Hours slept' })).toHaveDisplayValue('7.5'),
    );
    expect(card('Training').getByRole('radio', { name: 'Gym' })).toBeChecked();
    expect(card('Clean eating').getByRole('radio', { name: 'Clean' })).toBeChecked();
    expect(card('Sun').getByRole('textbox', { name: 'Minutes in the sun' })).toHaveDisplayValue(
      '25',
    );
  });

  it('uses the default goals before the profile exists', async () => {
    await renderToday({ profile: undefined });
    await userEvent.type(card('Sun').getByRole('textbox', { name: 'Minutes in the sun' }), '20');
    expect(card('Sun').getByText('Goal reached')).toBeInTheDocument();
  });
});
