import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { listGroups, saveFriend, saveGroup } from '@vitapact/core/storage';
import { openTestDatabase, sampleFriend, sampleGroup } from '@vitapact/core/storage/testing';
import { renderWithProviders } from '@vitapact/ui/testing';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import en from '../../locales/en/settings.json';
import { GroupsCard } from './GroupsCard';

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

const now = () => new Date('2026-10-12T09:00:00.000Z');

async function renderCard(withGroup = true) {
  const db = await openTestDatabase();
  await saveFriend(db, sampleFriend);
  if (withGroup) await saveGroup(db, sampleGroup);
  renderWithProviders(<GroupsCard db={db} now={now} />, { translations: { settings: en } });
  return { db, user: userEvent.setup() };
}

const dialog = (name: string) => screen.findByRole('dialog', { name });

describe('F3-ST-02 RF-25 groups in settings', () => {
  it('lists each group with its stake and how many members it has', async () => {
    await renderCard();
    expect(await screen.findByRole('heading', { name: sampleGroup.name })).toBeInTheDocument();
    expect(screen.getByText(`At stake: ${sampleGroup.stake}`)).toBeInTheDocument();
    expect(screen.getByText(/^\d+ members?$/)).toBeInTheDocument();
  });

  it('says there are no groups yet', async () => {
    await renderCard(false);
    expect(await screen.findByText(en.groups.empty)).toBeInTheDocument();
  });

  it('creates a group with a friend in it', async () => {
    const { db, user } = await renderCard(false);
    await user.click(await screen.findByRole('button', { name: en.groups.new }));
    const create = await dialog(en.groups.dialog.newTitle);
    await user.type(within(create).getByLabelText(en.groups.dialog.name), 'Office');
    await user.type(within(create).getByLabelText(en.groups.dialog.stake), 'brings the coffee');
    await user.click(within(create).getByRole('checkbox', { name: sampleFriend.nickname }));
    await user.click(within(create).getByRole('button', { name: en.groups.dialog.create }));
    expect(await screen.findByRole('heading', { name: 'Office' })).toBeInTheDocument();
    expect(await listGroups(db)).toEqual([
      expect.objectContaining({
        name: 'Office',
        stake: 'brings the coffee',
        memberIds: [sampleFriend.userId],
        createdAt: '2026-10-12T09:00:00.000Z',
      }),
    ]);
  });

  it('renames a group and changes its stake, keeping its id and creation date', async () => {
    const { db, user } = await renderCard();
    await user.click(await screen.findByRole('button', { name: `Edit ${sampleGroup.name}` }));
    const edit = await dialog(en.groups.dialog.editTitle);
    const name = within(edit).getByLabelText(en.groups.dialog.name);
    expect(name).toHaveValue(sampleGroup.name);
    await user.clear(name);
    await user.type(name, 'Night owls');
    await user.click(within(edit).getByRole('button', { name: en.groups.dialog.save }));
    expect(await screen.findByRole('heading', { name: 'Night owls' })).toBeInTheDocument();
    expect(await listGroups(db)).toEqual([
      { ...sampleGroup, name: 'Night owls', memberIds: [...sampleGroup.memberIds] },
    ]);
  });

  it('deletes a group only after confirming', async () => {
    const { db, user } = await renderCard();
    const remove = await screen.findByRole('button', { name: `Delete ${sampleGroup.name}` });
    await user.click(remove);
    const confirm = await dialog(`Delete ${sampleGroup.name}?`);
    await user.click(within(confirm).getByRole('button', { name: en.groups.dialog.cancel }));
    expect(await listGroups(db)).toHaveLength(1);

    await user.click(remove);
    await user.click(
      within(await dialog(`Delete ${sampleGroup.name}?`)).getByRole('button', {
        name: en.groups.confirmDelete.confirm,
      }),
    );
    await waitFor(() => expect(screen.getByText(en.groups.empty)).toBeInTheDocument());
    expect(await listGroups(db)).toEqual([]);
  });
});
