import { getWeighIn, saveProfile, saveWeighIn } from '@vitapact/core/storage';
import { openTestDatabase, sampleProfile } from '@vitapact/core/storage/testing';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import { useNavigation } from '../navigation/navigationStore';

const SUNDAY = '2026-10-18';
const MONDAY = '2026-10-19';
const TUESDAY = '2026-10-20';
const WEDNESDAY = '2026-10-21';
const WEEK = '2026-W42';

async function databaseWithProfile() {
  const db = await openTestDatabase();
  await saveProfile(db, sampleProfile);
  return db;
}

async function openOn(today: string, db?: Awaited<ReturnType<typeof databaseWithProfile>>) {
  const database = db ?? (await databaseWithProfile());
  render(<App openDatabase={() => Promise.resolve(database)} clock={() => today} />);
  await screen.findByRole('heading', { level: 1, name: 'Today' });
  return database;
}

const dialog = () => screen.findByRole('dialog', { name: 'Sunday weigh-in' });
const reminder = () => screen.findByRole('button', { name: 'Weigh in' });

async function enterWeight(kg: string) {
  const form = within(await dialog());
  await userEvent.type(form.getByRole('textbox', { name: /Weight/ }), kg);
  await userEvent.click(form.getByRole('checkbox', { name: /empty stomach/ }));
  await userEvent.click(form.getByRole('button', { name: 'Save' }));
}

describe('F3-TD-08 Sunday weigh-in (RF-05)', () => {
  beforeEach(() => {
    window.location.hash = '';
    useNavigation.getState().syncFromLocation();
  });

  it('opens the dialog on Sunday when the weigh-in is missing', async () => {
    await openOn(SUNDAY);
    expect(await dialog()).toBeInTheDocument();
  });

  it('does not open it on Sunday once the weigh-in is saved', async () => {
    const db = await databaseWithProfile();
    await saveWeighIn(db, { week: WEEK, weightKg: 70, measuredOn: SUNDAY, fastingConfirmed: true });
    await openOn(SUNDAY, db);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Weigh in' })).not.toBeInTheDocument();
  });

  it('does not open it by itself on the other days', async () => {
    await openOn(MONDAY);
    await reminder();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('F3-TD-09 weigh-in reminder and catch-up (RF-06, RF-07, D26)', () => {
  beforeEach(() => {
    window.location.hash = '';
    useNavigation.getState().syncFromLocation();
  });

  it('RF-06 keeps the reminder after "Later" on Sunday, on every screen', async () => {
    await openOn(SUNDAY);
    await userEvent.click(within(await dialog()).getByRole('button', { name: 'Later' }));
    expect(await screen.findByText(/Today's weigh-in is still to do/)).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    await userEvent.click(within(nav).getByRole('button', { name: 'Week' }));
    await screen.findByRole('heading', { level: 1, name: 'Week' });
    expect(await reminder()).toBeInTheDocument();
  });

  it.each([
    ['Monday', MONDAY],
    ['Tuesday', TUESDAY],
  ])('RF-07 shows the catch-up reminder on %s', async (_, today) => {
    await openOn(today);
    expect(await screen.findByText(/Sunday's weigh-in is still to do/)).toBeInTheDocument();
  });

  it('D26 shows no reminder from Wednesday on', async () => {
    const db = await openOn(WEDNESDAY);
    // The weigh-in has been read once the shell is up; nothing is due any more.
    await waitFor(async () => expect(await getWeighIn(db, WEEK)).toBeUndefined());
    expect(screen.queryByRole('button', { name: 'Weigh in' })).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('RF-07 saves a Tuesday catch-up to the week just closed, and the reminder goes', async () => {
    const db = await openOn(TUESDAY);
    await userEvent.click(await reminder());
    await enterWeight('72.4');
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Weigh in' })).not.toBeInTheDocument(),
    );
    expect(await getWeighIn(db, WEEK)).toEqual({
      week: WEEK,
      weightKg: 72.4,
      measuredOn: TUESDAY,
      fastingConfirmed: true,
    });
  });
});
