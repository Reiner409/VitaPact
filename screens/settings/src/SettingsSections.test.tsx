import { readFileSync } from 'node:fs';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createSigningKeys, publicKeyFingerprint } from '@vitapact/core/crypto';
import { exportData, getProfile, saveProfile, type Profile } from '@vitapact/core/storage';
import { openTestDatabase, sampleProfile } from '@vitapact/core/storage/testing';
import type { OpenedFile } from '@vitapact/platform';
import { renderWithProviders } from '@vitapact/ui/testing';
import { describe, expect, it, vi } from 'vitest';
import en from '../locales/en/settings.json';
import type { DataFiles } from './data/dataFiles';
import { SettingsScreen } from './SettingsScreen';

const EXPORTED_AT = new Date('2026-10-18T09:30:00.000Z');

function fakeFiles(opened?: OpenedFile): DataFiles & { saveFile: ReturnType<typeof vi.fn> } {
  return {
    saveFile: vi.fn().mockResolvedValue('saved'),
    openFile: vi.fn().mockResolvedValue(opened),
  };
}

function fileWith(text: string): OpenedFile {
  return { name: 'backup.json', bytes: new TextEncoder().encode(text) };
}

async function renderScreen(profile: Profile = sampleProfile, files = fakeFiles()) {
  const db = await openTestDatabase();
  await saveProfile(db, profile);
  const onProfileChange = vi.fn().mockResolvedValue(undefined);
  renderWithProviders(
    <SettingsScreen
      db={db}
      profile={await getProfile(db)}
      onProfileChange={onProfileChange}
      files={files}
      now={() => EXPORTED_AT}
    />,
    { translations: { settings: en } },
  );
  return { db, files, onProfileChange, user: userEvent.setup() };
}

/** A backup of another database holding `profile`, as the export of another device would be. */
async function backupOf(profile: Profile): Promise<string> {
  const other = await openTestDatabase();
  await saveProfile(other, profile);
  return exportData(other, EXPORTED_AT.toISOString());
}

describe('F3-ST-03 key fingerprint in settings', () => {
  it('shows the fingerprint core computes for this device key', async () => {
    const signingKeys = await createSigningKeys();
    await renderScreen({ ...sampleProfile, signingKeys });
    const expected = await publicKeyFingerprint(signingKeys.publicKey);
    expect(await screen.findByText(expected)).toBeInTheDocument();
  });

  it('explains that the key is not there yet when the device has none', async () => {
    await renderScreen();
    expect(screen.getByText(en.fingerprint.missing)).toBeInTheDocument();
  });
});

describe('F3-ST-05 about', () => {
  it('reads version and licence from the package, matching the app release', async () => {
    await renderScreen();
    const root = JSON.parse(
      readFileSync('package.json', 'utf8'),
    ) as { version: string };
    const about = screen.getByRole('region', { name: en.about.title });
    expect(within(about).getByText(root.version)).toBeInTheDocument();
    expect(within(about).getByText('GPL-3.0-only')).toBeInTheDocument();
  });
});

describe('RF-19 export and import of all data from settings', () => {
  it('saves the export to the file the user chooses', async () => {
    const { db, files, user } = await renderScreen();
    await user.click(screen.getByRole('button', { name: en.data.export }));
    expect(await screen.findByRole('status')).toHaveTextContent(en.data.notices.exported);
    expect(files.saveFile).toHaveBeenCalledWith({
      suggestedName: 'vitapact-backup-2026-10-18.json',
      contents: await exportData(db, EXPORTED_AT.toISOString()),
      filter: { name: en.data.fileType, extensions: ['json'] },
    });
  });

  it('changes nothing when the import is cancelled', async () => {
    const text = await backupOf({ ...sampleProfile, nickname: 'Restored' });
    const { db, onProfileChange, user } = await renderScreen(
      sampleProfile,
      fakeFiles(fileWith(text)),
    );
    await user.click(screen.getByRole('button', { name: en.data.import }));
    await user.click(await screen.findByRole('button', { name: en.data.cancel }));
    expect(await getProfile(db)).toMatchObject({ nickname: 'Rei' });
    expect(onProfileChange).not.toHaveBeenCalled();
  });

  it('replaces the data after confirmation and tells the app to reload it', async () => {
    const text = await backupOf({ ...sampleProfile, nickname: 'Restored' });
    const { db, onProfileChange, user } = await renderScreen(
      sampleProfile,
      fakeFiles(fileWith(text)),
    );
    await user.click(screen.getByRole('button', { name: en.data.import }));
    await user.click(await screen.findByRole('button', { name: en.data.overwrite.confirm }));
    expect(await screen.findByRole('status')).toHaveTextContent(en.data.notices.imported);
    expect(await getProfile(db)).toMatchObject({ nickname: 'Restored' });
    expect(onProfileChange).toHaveBeenCalledOnce();
  });

  it('shows a clear error for a file that is not a backup', async () => {
    const { db, user } = await renderScreen(sampleProfile, fakeFiles(fileWith('not json')));
    await user.click(screen.getByRole('button', { name: en.data.import }));
    await user.click(await screen.findByRole('button', { name: en.data.overwrite.confirm }));
    expect(await screen.findByRole('alert')).toHaveTextContent(en.data.notices.importDamaged);
    expect(await getProfile(db)).toMatchObject({ nickname: 'Rei' });
  });

  it('does nothing when the user closes the file dialog', async () => {
    const { user } = await renderScreen();
    await user.click(screen.getByRole('button', { name: en.data.import }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe("RF-19 importing another user's file needs a second confirmation", () => {
  it('asks again before replacing a signed identity with another user', async () => {
    const signingKeys = await createSigningKeys();
    const text = await backupOf({ ...sampleProfile, userId: crypto.randomUUID(), nickname: 'Sam' });
    const { db, user } = await renderScreen(
      { ...sampleProfile, signingKeys },
      fakeFiles(fileWith(text)),
    );
    await user.click(screen.getByRole('button', { name: en.data.import }));
    await user.click(await screen.findByRole('button', { name: en.data.overwrite.confirm }));
    const second = await screen.findByRole('button', { name: en.data.otherUser.confirm });
    expect(await getProfile(db)).toMatchObject({ nickname: 'Rei' });
    await user.click(second);
    await screen.findByRole('status');
    expect(await getProfile(db)).toMatchObject({ nickname: 'Sam' });
  });
});
