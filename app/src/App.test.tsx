import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from './App';
import { useNavigation } from './navigation/navigationStore';

describe('F1-01 app shell', () => {
  beforeEach(() => {
    window.location.hash = '';
    useNavigation.getState().syncFromLocation();
  });

  it('opens on Today', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Today' })).toBeInTheDocument();
  });

  it.each(['Week', 'Friends', 'Noteboard', 'Settings', 'Today'])(
    'navigates to %s from the sidebar',
    async (name) => {
      render(<App />);
      const nav = screen.getByRole('navigation', { name: 'Main navigation' });
      await userEvent.click(within(nav).getByRole('button', { name }));
      expect(screen.getByRole('heading', { level: 1, name })).toBeInTheDocument();
    },
  );

  it('opens onboarding from its address', () => {
    window.location.hash = '#/onboarding';
    useNavigation.getState().syncFromLocation();
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Welcome' })).toBeInTheDocument();
  });
});
