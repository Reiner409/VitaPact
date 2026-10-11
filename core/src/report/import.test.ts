import { describe, expect, it } from 'vitest';
import { createSigningKeys, exportPublicKey } from '../crypto';
import { encodeReportContent } from './encoding';
import {
  createReport,
  readReport,
  importFriendReport,
  type FriendDirectory,
  type KnownFriend,
  type WeekReportInput,
} from '.';

const ownUserId = '0b1c2d3e-4f50-4617-8293-a4b5c6d7e8f9';
const friendWeek: WeekReportInput = {
  userId: '3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90',
  nickname: 'Giulia',
  hideWeight: false,
  generatedOn: '2026-10-11',
  week: '2026-W41',
  logged: 6,
  sleepAvg: 7.5,
  sleepOk: 5,
  trainDone: 3,
  trainGoal: 3,
  trainMin: 150,
  cleanOk: 4,
  sunOk: 3,
  score: 74,
};

const friendKeys = await createSigningKeys();
const friendPublicKey = await exportPublicKey(friendKeys.publicKey);
const strangerKeys = await createSigningKeys();
const friendReport = await createReport(friendWeek, friendKeys);

function directory(
  friend?: KnownFriend,
  importedWeeks: readonly string[] = [],
): FriendDirectory & { asked: string[] } {
  const asked: string[] = [];
  return {
    asked,
    findFriend(userId) {
      asked.push(userId);
      return Promise.resolve(friend?.userId === userId ? friend : undefined);
    },
    hasReport(userId, week) {
      return Promise.resolve(friend?.userId === userId && importedWeeks.includes(week));
    },
  };
}

const knownFriend: KnownFriend = { userId: friendWeek.userId, publicKey: friendPublicKey };

describe("RF-12 RF-28 importing a friend's report", () => {
  it('RF-12 registers the public key with the first report from a UUID', async () => {
    const outcome = await importFriendReport(friendReport, { ownUserId, friends: directory() });

    expect(outcome).toMatchObject({
      kind: 'newFriend',
      summary: { uid: friendWeek.userId, nick: 'Giulia', week: '2026-W41', pub: friendPublicKey },
    });
  });

  it('RF-12 accepts a new week from a known friend signed with the same key', async () => {
    const outcome = await importFriendReport(friendReport, {
      ownUserId,
      friends: directory(knownFriend, ['2026-W40']),
    });

    expect(outcome).toMatchObject({ kind: 'update', summary: { week: '2026-W41' } });
  });

  it('RF-12 replaces a week already imported from the same friend', async () => {
    const outcome = await importFriendReport(friendReport, {
      ownUserId,
      friends: directory(knownFriend, ['2026-W40', '2026-W41']),
    });

    expect(outcome).toMatchObject({ kind: 'replaceWeek', summary: { week: '2026-W41' } });
  });

  it('RF-28 rejects a report from a known UUID signed with a different key', async () => {
    const impostor = await createReport(friendWeek, strangerKeys);
    const outcome = await importFriendReport(impostor, {
      ownUserId,
      friends: directory(knownFriend),
    });

    expect(outcome).toEqual({ kind: 'rejected', reason: 'keyChanged' });
  });

  it('RF-28 rejects a report whose signature does not match its content', async () => {
    const read = await readReport(friendReport);
    if (!read.ok) throw new Error(read.error);
    const { sig, ...content } = read.summary;
    const raisedScore = JSON.stringify({ ...content, score: 95 });
    const tampered = await encodeReportContent(raisedScore, sig);
    const outcome = await importFriendReport(tampered, { ownUserId, friends: directory() });

    expect(outcome).toEqual({ kind: 'rejected', reason: 'invalidSignature' });
  });

  it('RF-12 asks to update the app for a report from a future version', async () => {
    const future = friendReport.slice();
    future.set(new TextEncoder().encode('VPACT2.'));
    const outcome = await importFriendReport(future, { ownUserId, friends: directory() });

    expect(outcome).toEqual({ kind: 'rejected', reason: 'futureVersion' });
  });

  it('RF-12 refuses your own report as a friend', async () => {
    const ownReport = await createReport({ ...friendWeek, userId: ownUserId }, friendKeys);
    const friends = directory();
    const outcome = await importFriendReport(ownReport, { ownUserId, friends });

    expect(outcome).toEqual({ kind: 'rejected', reason: 'ownReport' });
    expect(friends.asked).toEqual([]);
  });

  it('RF-12 rejects content that is not a VitaPact report', async () => {
    const outcome = await importFriendReport(new TextEncoder().encode('https://example.com'), {
      ownUserId,
      friends: directory(),
    });

    expect(outcome).toEqual({ kind: 'rejected', reason: 'notAReport' });
  });
});
