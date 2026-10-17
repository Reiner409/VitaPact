import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NICKNAME_MAX_LENGTH } from '@vitapact/core/report';
import { getProfile, type VitaPactDatabase } from '@vitapact/core/storage';
import { openTestDatabase } from '@vitapact/core/storage/testing';
import { axeViolations, renderWithProviders } from '@vitapact/ui/testing';
import { describe, expect, it, vi } from 'vitest';
import en from '../locales/en/onboarding.json';
import { OnboardingScreen } from './OnboardingScreen';

const unusedDatabase = {} as VitaPactDatabase;
const noop = () => Promise.resolve();

const renderScreen = (db = unusedDatabase, onProfileChange = noop) =>
  renderWithProviders(
    <OnboardingScreen
      db={db}
      onProfileChange={onProfileChange}
      now={() => new Date('2026-10-17T10:00:00Z')}
    />,
    { translations: { onboarding: en } },
  );
const nicknameField = () => screen.getByRole('textbox', { name: en.nickname.label });
const continueButton = () => screen.getByRole('button', { name: en.continue });
const stepTwo = () => screen.queryByText('Step 2 of 3');

describe('RF-01 welcome step 1: nickname', () => {
  it('opens on the first of three steps under the welcome title', () => {
    renderScreen();
    expect(screen.getByRole('heading', { level: 1, name: en.title })).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
  });

  it('does not flag the empty field before the user tries to continue', () => {
    renderScreen();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('does not continue with an empty nickname', async () => {
    renderScreen();
    await userEvent.click(continueButton());
    expect(screen.getByRole('alert')).toHaveTextContent(en.nickname.empty);
    expect(stepTwo()).not.toBeInTheDocument();
  });

  it('does not continue with a nickname of only spaces', async () => {
    renderScreen();
    await userEvent.type(nicknameField(), '   ');
    await userEvent.click(continueButton());
    expect(screen.getByRole('alert')).toHaveTextContent(en.nickname.empty);
    expect(stepTwo()).not.toBeInTheDocument();
  });

  it('refuses a nickname longer than the report limit', async () => {
    renderScreen();
    await userEvent.type(nicknameField(), 'x'.repeat(NICKNAME_MAX_LENGTH + 1));
    await userEvent.click(continueButton());
    expect(screen.getByRole('alert')).toHaveTextContent(`at most ${NICKNAME_MAX_LENGTH}`);
    expect(stepTwo()).not.toBeInTheDocument();
  });

  it('counts accented letters and emoji as one character each and continues', async () => {
    renderScreen();
    await userEvent.type(nicknameField(), 'Élodie 🌞');
    expect(screen.getByText(new RegExp(`^8 of ${NICKNAME_MAX_LENGTH} characters`))).toBeVisible();
    await userEvent.click(continueButton());
    expect(stepTwo()).toBeInTheDocument();
  });

  it('continues with the Enter key', async () => {
    renderScreen();
    await userEvent.type(nicknameField(), 'Rei{Enter}');
    expect(stepTwo()).toBeInTheDocument();
  });

  it('keeps the nickname when going back from the next step', async () => {
    renderScreen();
    await userEvent.type(nicknameField(), 'Rei{Enter}');
    await userEvent.click(screen.getByRole('button', { name: en.back }));
    expect(nicknameField()).toHaveValue('Rei');
  });

  it('hands on the nickname without the spaces around it', async () => {
    renderScreen();
    await userEvent.type(nicknameField(), '  Rei  {Enter}');
    await userEvent.click(screen.getByRole('button', { name: en.back }));
    expect(nicknameField()).toHaveValue('Rei');
  });

  it('clears the error as soon as the nickname becomes valid', async () => {
    renderScreen();
    await userEvent.click(continueButton());
    await userEvent.type(nicknameField(), 'Rei');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('has no accessibility violations with the error shown', async () => {
    const { container } = renderScreen();
    await userEvent.click(continueButton());
    expect(await axeViolations(container)).toEqual([]);
  });
});

const goalField = (label: string) => screen.getByRole('textbox', { name: label });

async function toGoals() {
  await userEvent.type(nicknameField(), 'Rei{Enter}');
}

describe('RF-01 welcome step 2: goals', () => {
  it('shows the three goals with their defaults', async () => {
    renderScreen();
    await toGoals();
    expect(goalField(en.goals.sleepHours.label)).toHaveValue('7.5');
    expect(goalField(en.goals.workoutsPerWeek.label)).toHaveValue('3');
    expect(goalField(en.goals.sunMinutes.label)).toHaveValue('20');
  });

  it('flags a goal out of range under its field and stays on the step', async () => {
    renderScreen();
    await toGoals();
    await userEvent.clear(goalField(en.goals.sunMinutes.label));
    await userEvent.type(goalField(en.goals.sunMinutes.label), '9999');
    await userEvent.click(continueButton());
    expect(screen.getByRole('alert')).toHaveTextContent('Choose a value from');
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
  });

  it('keeps a changed goal when going back one step', async () => {
    renderScreen();
    await toGoals();
    await userEvent.clear(goalField(en.goals.sleepHours.label));
    await userEvent.type(goalField(en.goals.sleepHours.label), '8');
    await userEvent.click(continueButton());
    await userEvent.click(screen.getByRole('button', { name: en.back }));
    expect(goalField(en.goals.sleepHours.label)).toHaveValue('8');
  });
});

describe('RF-01 RF-02 welcome step 3: privacy and acceptance', () => {
  async function toPrivacy() {
    await toGoals();
    await userEvent.click(continueButton());
  }

  it('explains that everything stays on this PC, with the motto above the button', async () => {
    renderScreen();
    await toPrivacy();
    expect(screen.getByRole('heading', { name: en.privacy.title })).toBeInTheDocument();
    expect(screen.getByText(en.privacy.motto)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: en.privacy.accept })).toBeInTheDocument();
  });

  it('creates the profile with a UUID and signing keys on acceptance', async () => {
    const db = await openTestDatabase();
    const onProfileChange = vi.fn(noop);
    renderScreen(db, onProfileChange);
    await toPrivacy();
    await userEvent.click(screen.getByRole('button', { name: en.privacy.accept }));
    await vi.waitFor(() => expect(onProfileChange).toHaveBeenCalledOnce());
    const profile = await getProfile(db);
    expect(profile).toMatchObject({
      nickname: 'Rei',
      goals: { sleepHours: 7.5, workoutsPerWeek: 3, sunMinutes: 20 },
      createdAt: '2026-10-17T10:00:00.000Z',
    });
    expect(profile?.userId).toMatch(/^[0-9a-f-]{36}$/);
    expect(profile?.signingKeys?.privateKey).toBeDefined();
  });

  it('says so and stays on the step when the profile cannot be saved', async () => {
    renderScreen(unusedDatabase);
    await toPrivacy();
    await userEvent.click(screen.getByRole('button', { name: en.privacy.accept }));
    expect(await screen.findByText(en.privacy.failed)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderScreen();
    await toPrivacy();
    expect(await axeViolations(container)).toEqual([]);
  });
});
