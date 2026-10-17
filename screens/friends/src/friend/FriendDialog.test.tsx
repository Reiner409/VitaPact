import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getFriend, listGroups, saveFriendReport, saveGroup } from '@vitapact/core/storage';
import {
  openTestDatabase,
  sampleFriend,
  sampleGroup,
  sampleProfile,
  sampleReport,
} from '@vitapact/core/storage/testing';
import content from '@vitapact/i18n/locales/en/content.json';
import { renderWithProviders } from '@vitapact/ui/testing';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import en from '../../locales/en/friends.json';
import { FriendsScreen } from '../FriendsScreen';

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

async function renderWithFriend(summary = sampleReport.summary) {
  const db = await openTestDatabase();
  await saveFriendReport(db, sampleFriend, { ...sampleReport, summary });
  await saveGroup(db, { ...sampleGroup, memberIds: [sampleFriend.userId] });
  renderWithProviders(<FriendsScreen db={db} profile={sampleProfile} today="2026-10-12" />, {
    translations: { friends: en, content },
  });
  const user = userEvent.setup();
  const ranking = await screen.findByRole('list', { name: 'Week 41 ranking' });
  await user.click(
    within(ranking).getByRole('button', { name: new RegExp(sampleFriend.nickname) }),
  );
  const dialog = await screen.findByRole('dialog', { name: sampleFriend.nickname });
  return { db, user, dialog };
}

describe('F3-FR-08 RF-13 a friend history', () => {
  it('opens from the ranking with the scores and the weight of the last 12 weeks', async () => {
    const { dialog } = await renderWithFriend();
    expect(within(dialog).getByText(en.history.scores)).toBeInTheDocument();
    expect(within(dialog).getByText(en.history.weight)).toBeInTheDocument();
  });

  it('says the weight is not shared when the friend hides it', async () => {
    const hidden = { ...sampleReport.summary };
    delete hidden.weight;
    delete hidden.delta;
    const { dialog } = await renderWithFriend(hidden);
    expect(within(dialog).getByText(en.history.weightHidden)).toBeInTheDocument();
    expect(within(dialog).queryByText(en.history.weight)).not.toBeInTheDocument();
  });
});

describe('F3-FR-09 RF-16 remove a friend', () => {
  it('removes the friend from every group after a confirmation', async () => {
    const { db, user, dialog } = await renderWithFriend();
    await user.click(
      within(dialog).getByRole('button', { name: `Remove ${sampleFriend.nickname}` }),
    );
    const confirm = await screen.findByRole('dialog', {
      name: `Remove ${sampleFriend.nickname}?`,
    });
    await user.click(within(confirm).getByRole('button', { name: en.remove.confirm }));

    expect(await screen.findByText(`${sampleFriend.nickname} was removed.`)).toBeInTheDocument();
    expect(await getFriend(db, sampleFriend.userId)).toBeUndefined();
    expect((await listGroups(db))[0]?.memberIds).toEqual([]);
    expect(screen.getByRole('list', { name: 'Week 41 ranking' })).not.toHaveTextContent(
      sampleFriend.nickname,
    );
  });

  it('keeps the friend when the user changes their mind', async () => {
    const { db, user, dialog } = await renderWithFriend();
    await user.click(
      within(dialog).getByRole('button', { name: `Remove ${sampleFriend.nickname}` }),
    );
    const confirm = await screen.findByRole('dialog', {
      name: `Remove ${sampleFriend.nickname}?`,
    });
    await user.click(within(confirm).getByRole('button', { name: en.remove.cancel }));
    expect(await getFriend(db, sampleFriend.userId)).toBeDefined();
  });
});
