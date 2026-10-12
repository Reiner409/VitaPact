import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NICKNAME_MAX_LENGTH } from '@vitapact/core/report';
import { axeViolations, renderWithProviders } from '@vitapact/ui/testing';
import { describe, expect, it } from 'vitest';
import en from '../locales/en/onboarding.json';
import { OnboardingScreen } from './OnboardingScreen';

const renderScreen = () =>
  renderWithProviders(<OnboardingScreen />, { translations: { onboarding: en } });
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
