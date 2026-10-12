import { saveProfile } from '@vitapact/core/storage';
import { openTestDatabase, sampleProfile } from '@vitapact/core/storage/testing';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from './App';
import { useNavigation } from './navigation/navigationStore';

function openTo(hash: string) {
  window.location.hash = hash;
  useNavigation.getState().syncFromLocation();
}

async function databaseWithProfile() {
  const db = await openTestDatabase();
  await saveProfile(db, sampleProfile);
  return db;
}

const heading = (name: string) => screen.findByRole('heading', { level: 1, name });

describe('F1-01 app shell', () => {
  beforeEach(() => openTo(''));

  it('opens on Today', async () => {
    const db = await databaseWithProfile();
    render(<App openDatabase={() => Promise.resolve(db)} />);
    expect(await heading('Today')).toBeInTheDocument();
  });

  it.each(['Week', 'Friends', 'Noteboard', 'Settings', 'Today'])(
    'navigates to %s from the sidebar',
    async (name) => {
      const db = await databaseWithProfile();
      render(<App openDatabase={() => Promise.resolve(db)} />);
      await heading('Today');
      const nav = screen.getByRole('navigation', { name: 'Main navigation' });
      await userEvent.click(within(nav).getByRole('button', { name }));
      expect(await heading(name)).toBeInTheDocument();
    },
  );
});

describe('RF-01 first launch', () => {
  beforeEach(() => openTo(''));

  it('shows onboarding, without the navigation, while there is no profile', async () => {
    const db = await openTestDatabase();
    render(<App openDatabase={() => Promise.resolve(db)} />);
    expect(await heading('Welcome')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('keeps showing onboarding when another screen is asked for by address', async () => {
    openTo('#/week');
    const db = await openTestDatabase();
    render(<App openDatabase={() => Promise.resolve(db)} />);
    expect(await heading('Welcome')).toBeInTheDocument();
  });

  it('never shows onboarding again once the profile exists', async () => {
    openTo('#/onboarding');
    const db = await databaseWithProfile();
    render(<App openDatabase={() => Promise.resolve(db)} />);
    expect(await heading('Today')).toBeInTheDocument();
  });
});

describe('A1 local data', () => {
  beforeEach(() => openTo(''));

  it('explains that the data cannot be opened when the database fails', async () => {
    render(<App openDatabase={() => Promise.reject(new Error('blocked'))} />);
    expect(await screen.findByText("Your data can't be opened")).toBeInTheDocument();
  });
});
