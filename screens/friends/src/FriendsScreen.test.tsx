import { listGroups, saveFriend, saveGroup, type Group } from '@vitapact/core/storage';
import { openTestDatabase, sampleFriend, sampleGroup } from '@vitapact/core/storage/testing';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@vitapact/ui/testing';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import en from '../locales/en/friends.json';
import { FriendsScreen } from './FriendsScreen';

// jsdom has no layout, and the open list scrolls to the chosen group.
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

const now = () => new Date('2026-10-12T09:00:00.000Z');
const ana = { ...sampleFriend, userId: 'a1b2c3d4-0000-4000-8000-000000000001', nickname: 'Ana' };
const office: Group = {
  id: 'group-2',
  name: 'Office',
  stake: 'brings the coffee',
  memberIds: [ana.userId],
  createdAt: '2026-10-04T09:00:00.000Z',
};

async function renderFriends(seed: { groups?: Group[]; friends?: (typeof sampleFriend)[] } = {}) {
  const db = await openTestDatabase();
  await Promise.all([
    ...(seed.groups ?? []).map((group) => saveGroup(db, group)),
    ...(seed.friends ?? []).map((friend) => saveFriend(db, friend)),
  ]);
  renderWithProviders(<FriendsScreen db={db} now={now} />, { translations: { friends: en } });
  return { db, user: userEvent.setup() };
}

const weekRanking = () => screen.getByRole('list', { name: /Week \d+ ranking/ });

async function fillNewGroup(user: ReturnType<typeof userEvent.setup>, name: string, stake: string) {
  const dialog = await screen.findByRole('dialog', { name: en.newGroup.title });
  if (name) await user.type(within(dialog).getByLabelText(en.newGroup.name), name);
  if (stake) await user.type(within(dialog).getByLabelText(en.newGroup.stake), stake);
  return dialog;
}

describe('FriendsScreen', () => {
  it('shows its translated title as the page heading', async () => {
    await renderFriends();
    expect(await screen.findByRole('heading', { level: 1, name: en.title })).toBeInTheDocument();
  });
});

describe('RF-25 friends screen without groups', () => {
  it('shows the empty state with the action that creates the first group', async () => {
    await renderFriends();
    expect(await screen.findByRole('heading', { name: en.empty.title })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: en.newGroup.open })).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: en.group.select })).not.toBeInTheDocument();
  });
});

describe('RF-25 group selector', () => {
  it('opens on the oldest group and shows its stake and its members in the ranking', async () => {
    await renderFriends({ groups: [office, sampleGroup], friends: [sampleFriend, ana] });
    expect(await screen.findByText('At stake: brings the coffee')).toBeInTheDocument();
    expect(weekRanking()).toHaveTextContent('Ana');
  });

  it('changing the group updates what the screen shows', async () => {
    const { user } = await renderFriends({
      groups: [office, sampleGroup],
      friends: [sampleFriend, ana],
    });
    await user.click(await screen.findByRole('combobox', { name: en.group.select }));
    await user.click(screen.getByRole('option', { name: sampleGroup.name, hidden: true }));
    expect(screen.getByText(`At stake: ${sampleGroup.stake}`)).toBeInTheDocument();
    const members = weekRanking();
    expect(members).toHaveTextContent('Sam');
    expect(members).not.toHaveTextContent('Ana');
  });

  it('RF-14 shows a member without a report this week as waiting, with no score', async () => {
    await renderFriends({ groups: [office], friends: [ana] });
    await screen.findByText('At stake: brings the coffee');
    const [row] = within(weekRanking())
      .getAllByRole('listitem')
      .filter((item) => item.textContent?.includes('Ana'));
    expect(row).toHaveTextContent(en.ranking.waiting);
  });

  it('orders two friends with the same nickname by user id', async () => {
    const firstSam = { ...sampleFriend, userId: 'a0000000-0000-4000-8000-000000000001' };
    const secondSam = { ...sampleFriend, userId: 'b0000000-0000-4000-8000-000000000002' };
    const group = { ...office, memberIds: [secondSam.userId, firstSam.userId] };
    const { user } = await renderFriends({ groups: [group], friends: [secondSam, firstSam] });
    await user.click(await screen.findByRole('button', { name: en.newGroup.open }));
    const dialog = await screen.findByRole('dialog', { name: en.newGroup.title });
    const chips = within(dialog).getAllByRole('checkbox', { name: 'Sam' });
    expect(chips.map((chip) => (chip as HTMLInputElement).value)).toEqual([
      firstSam.userId,
      secondSam.userId,
    ]);
  });

  it('shows a nickname with markup as plain text (RNF-05)', async () => {
    const tricky = { ...ana, nickname: '<b>Ana</b>' };
    await renderFriends({ groups: [office], friends: [tricky] });
    expect(await screen.findAllByText('<b>Ana</b>')).not.toHaveLength(0);
    expect(document.querySelector('b')).toBeNull();
  });
});

describe('RF-25 new group', () => {
  it('requires a name and a stake and saves nothing without them', async () => {
    const { db, user } = await renderFriends();
    await user.click(await screen.findByRole('button', { name: en.newGroup.open }));
    const dialog = await fillNewGroup(user, '', '');
    await user.click(within(dialog).getByRole('button', { name: en.newGroup.create }));
    expect(within(dialog).getByText(en.newGroup.errors.nameMissing)).toBeInTheDocument();
    expect(within(dialog).getByText(en.newGroup.errors.stakeMissing)).toBeInTheDocument();
    expect(await listGroups(db)).toEqual([]);

    await user.type(within(dialog).getByLabelText(en.newGroup.name), 'Office');
    expect(within(dialog).queryByText(en.newGroup.errors.nameMissing)).not.toBeInTheDocument();
    expect(within(dialog).getByText(en.newGroup.errors.stakeMissing)).toBeInTheDocument();
  });

  it('saves the group with the chosen friends and selects it', async () => {
    const { db, user } = await renderFriends({ friends: [sampleFriend, ana] });
    await user.click(await screen.findByRole('button', { name: en.newGroup.open }));
    const dialog = await fillNewGroup(user, '  Five-a-side ', 'buys the pizza');
    await user.click(within(dialog).getByRole('checkbox', { name: 'Sam' }));
    await user.click(within(dialog).getByRole('button', { name: en.newGroup.create }));

    expect(await screen.findByText('At stake: buys the pizza')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: en.group.select })).toHaveValue('Five-a-side');
    const [saved] = await listGroups(db);
    expect(saved).toMatchObject({
      name: 'Five-a-side',
      stake: 'buys the pizza',
      memberIds: [sampleFriend.userId],
      createdAt: '2026-10-12T09:00:00.000Z',
    });
  });

  it('lets the same friend belong to two groups', async () => {
    const { db, user } = await renderFriends({ groups: [office], friends: [ana] });
    await user.click(await screen.findByRole('button', { name: en.newGroup.open }));
    const dialog = await fillNewGroup(user, 'Running club', 'pays for breakfast');
    await user.click(within(dialog).getByRole('checkbox', { name: 'Ana' }));
    await user.click(within(dialog).getByRole('button', { name: en.newGroup.create }));

    await screen.findByText('At stake: pays for breakfast');
    const groups = await listGroups(db);
    expect(groups.filter((group) => group.memberIds.includes(ana.userId))).toHaveLength(2);
  });

  it('can be created before any friend is imported', async () => {
    const { db, user } = await renderFriends();
    await user.click(await screen.findByRole('button', { name: en.newGroup.open }));
    const dialog = await fillNewGroup(user, 'Office', 'brings the coffee');
    expect(within(dialog).getByText(en.newGroup.noFriendsYet)).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: en.newGroup.create }));
    expect(await screen.findByText(en.group.noMembers)).toBeInTheDocument();
    expect(await listGroups(db)).toHaveLength(1);
  });

  it('keeps the dialog open and says so when the group cannot be saved', async () => {
    const { db, user } = await renderFriends();
    await user.click(await screen.findByRole('button', { name: en.newGroup.open }));
    const dialog = await fillNewGroup(user, 'Office', 'brings the coffee');
    db.close();
    await user.click(within(dialog).getByRole('button', { name: en.newGroup.create }));
    expect(await within(dialog).findByText(en.newGroup.saveFailed)).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: en.newGroup.create })).not.toHaveAttribute(
      'aria-busy',
    );
    expect(within(dialog).getByLabelText(en.newGroup.name)).toHaveValue('Office');
  });

  it('cancelling closes the dialog and saves nothing', async () => {
    const { db, user } = await renderFriends();
    await user.click(await screen.findByRole('button', { name: en.newGroup.open }));
    const dialog = await fillNewGroup(user, 'Office', '');
    await user.click(within(dialog).getByRole('button', { name: en.newGroup.cancel }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(await listGroups(db)).toEqual([]);
  });
});
