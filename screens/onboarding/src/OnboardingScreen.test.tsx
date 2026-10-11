import { screen } from '@testing-library/react';
import { renderWithProviders } from '@vitapact/ui/testing';
import { describe, expect, it } from 'vitest';
import en from '../locales/en/onboarding.json';
import { OnboardingScreen } from './OnboardingScreen';

describe('OnboardingScreen (F1-01 empty screen)', () => {
  it('shows its translated title as the page heading', () => {
    renderWithProviders(<OnboardingScreen />, { translations: { onboarding: en } });
    expect(screen.getByRole('heading', { level: 1, name: en.title })).toBeInTheDocument();
  });
});
