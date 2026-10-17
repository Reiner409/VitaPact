import { describe, expect, it } from 'vitest';
import {
  getFriend,
  listFriendReports,
  listGroups,
  removeFriend,
  saveFriend,
  saveFriendReport,
  saveGroup,
} from './index';
import { openTestDatabase, sampleFriend, sampleGroup, sampleReport } from './testing';

const other = { ...sampleFriend, userId: 'b0000000-0000-4000-8000-000000000002', nickname: 'Ana' };

describe('F3-FR-09 RF-16 removing a friend', () => {
  it('removes the friend, their reports and their place in every group, and nothing else', async () => {
    const db = await openTestDatabase();
    await saveFriendReport(db, sampleFriend, sampleReport);
    await saveFriendReport(db, sampleFriend, { ...sampleReport, week: '2026-W40' });
    await saveFriendReport(db, other, { ...sampleReport, userId: other.userId });
    const both = [sampleFriend.userId, other.userId];
    await saveGroup(db, { ...sampleGroup, memberIds: both });
    await saveGroup(db, { ...sampleGroup, id: 'group-2', memberIds: [sampleFriend.userId] });

    await removeFriend(db, sampleFriend.userId);

    expect(await getFriend(db, sampleFriend.userId)).toBeUndefined();
    expect((await listFriendReports(db)).map(({ userId }) => userId)).toEqual([other.userId]);
    const groups = await listGroups(db);
    expect(groups.map(({ memberIds }) => memberIds)).toEqual([[other.userId], []]);
    expect(await getFriend(db, other.userId)).toBeDefined();
  });

  it('lets the same friend come back later with a new key', async () => {
    const db = await openTestDatabase();
    await saveFriend(db, sampleFriend);
    await removeFriend(db, sampleFriend.userId);
    await saveFriend(db, { ...sampleFriend, publicKey: 'a-new-key' });
    expect(await getFriend(db, sampleFriend.userId)).toMatchObject({ publicKey: 'a-new-key' });
  });
});
