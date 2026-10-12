import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getProfile, saveProfile } from '@vitapact/core/storage';
import { openTestDatabase, sampleProfile } from '@vitapact/core/storage/testing';
import { renderWithProviders } from '@vitapact/ui/testing';
import { describe, expect, it, vi } from 'vitest';
import en from '../locales/en/settings.json';
import { SettingsScreen } from './SettingsScreen';

async function renderScreen() {
  const db = await openTestDatabase();
  await saveProfile(db, sampleProfile);
  const onProfileChange = vi.fn().mockResolvedValue(undefined);
  const copyText = vi.fn().mockResolvedValue(undefined);
  renderWithProviders(
    <SettingsScreen
      db={db}
      profile={await getProfile(db)}
      onProfileChange={onProfileChange}
      copyText={copyText}
    />,
    { translations: { settings: en } },
  );
  return { db, onProfileChange, copyText, user: userEvent.setup() };
}

describe('SettingsScreen', () => {
  it('shows its translated title as the page heading', async () => {
    await renderScreen();
    expect(screen.getByRole('heading', { level: 1, name: en.title })).toBeInTheDocument();
  });
});

describe('RF-01 settings save the profile in the local database', () => {
  it('stores the edited profile and tells the app it changed', async () => {
    const { db, onProfileChange, user } = await renderScreen();
    const nickname = screen.getByRole('textbox', { name: en.profile.nickname });
    await user.clear(nickname);
    await user.type(nickname, 'Sam');
    await user.click(screen.getByRole('button', { name: en.profile.yes }));
    await user.click(screen.getByRole('button', { name: en.profile.save }));
    await screen.findByRole('status');
    expect(await getProfile(db)).toMatchObject({ nickname: 'Sam', hideWeight: true });
    expect(onProfileChange).toHaveBeenCalledOnce();
  });
});

describe('RF-02 settings never change the user id', () => {
  it('keeps the stored UUID after a save', async () => {
    const { db, user } = await renderScreen();
    await user.click(screen.getByRole('button', { name: en.profile.save }));
    await screen.findByRole('status');
    expect((await getProfile(db))?.userId).toBe(sampleProfile.userId);
  });

  it('hands the UUID to the copy function', async () => {
    const { copyText, user } = await renderScreen();
    await user.click(screen.getByRole('button', { name: en.profile.copyUserId }));
    expect(copyText).toHaveBeenCalledWith(sampleProfile.userId);
  });
});
