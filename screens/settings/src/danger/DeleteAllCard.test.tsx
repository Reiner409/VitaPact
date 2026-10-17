import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getProfile, saveProfile } from '@vitapact/core/storage';
import { openTestDatabase, sampleProfile } from '@vitapact/core/storage/testing';
import { renderWithProviders } from '@vitapact/ui/testing';
import { describe, expect, it, vi } from 'vitest';
import en from '../../locales/en/settings.json';
import { DeleteAllCard } from './DeleteAllCard';

async function renderCard() {
  const db = await openTestDatabase();
  await saveProfile(db, sampleProfile);
  const onDeleted = vi.fn().mockResolvedValue(undefined);
  renderWithProviders(<DeleteAllCard db={db} onDeleted={onDeleted} />, {
    translations: { settings: en },
  });
  return { db, onDeleted, user: userEvent.setup() };
}

describe('F3-ST-04 RF-20 delete all data', () => {
  it('asks twice, the second time with the word typed, then deletes everything', async () => {
    const { db, onDeleted, user } = await renderCard();
    await user.click(screen.getByRole('button', { name: en.deleteAll.open }));
    const first = await screen.findByRole('dialog', { name: en.deleteAll.first.title });
    await user.click(within(first).getByRole('button', { name: en.deleteAll.first.confirm }));

    const second = await screen.findByRole('dialog', { name: en.deleteAll.second.title });
    const confirm = within(second).getByRole('button', { name: en.deleteAll.second.confirm });
    expect(confirm).toBeDisabled();
    await user.type(within(second).getByLabelText(en.deleteAll.second.label), 'delete');
    expect(confirm).toBeDisabled();
    await user.clear(within(second).getByLabelText(en.deleteAll.second.label));
    await user.type(within(second).getByLabelText(en.deleteAll.second.label), 'DELETE');
    await user.click(confirm);

    await vi.waitFor(() => expect(onDeleted).toHaveBeenCalledOnce());
    expect(await getProfile(db)).toBeUndefined();
  });

  it('keeps everything when the user cancels', async () => {
    const { db, onDeleted, user } = await renderCard();
    await user.click(screen.getByRole('button', { name: en.deleteAll.open }));
    const first = await screen.findByRole('dialog', { name: en.deleteAll.first.title });
    await user.click(within(first).getByRole('button', { name: en.deleteAll.cancel }));
    expect(onDeleted).not.toHaveBeenCalled();
    expect(await getProfile(db)).toBeDefined();
  });

  it('says so and changes nothing when the database refuses', async () => {
    const { db, onDeleted, user } = await renderCard();
    db.close();
    await user.click(screen.getByRole('button', { name: en.deleteAll.open }));
    await user.click(
      within(await screen.findByRole('dialog', { name: en.deleteAll.first.title })).getByRole(
        'button',
        { name: en.deleteAll.first.confirm },
      ),
    );
    const second = await screen.findByRole('dialog', { name: en.deleteAll.second.title });
    await user.type(within(second).getByLabelText(en.deleteAll.second.label), 'DELETE');
    await user.click(within(second).getByRole('button', { name: en.deleteAll.second.confirm }));
    expect(await screen.findByText(en.deleteAll.failed)).toBeInTheDocument();
    expect(onDeleted).not.toHaveBeenCalled();
  });
});
