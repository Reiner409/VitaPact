import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import { openDatabase } from './database';
import type { Note } from './notes/note';
import type { DailyEntry, Friend, FriendReport, Group, Profile, WeighIn } from './records';
import type { SchemaVersion } from './schema';

/** A database in a fresh in-memory IndexedDB, so tests never share data. */
export function openTestDatabase(
  versions?: readonly SchemaVersion[],
  indexedDB = new IDBFactory(),
) {
  return openDatabase({ indexedDB, IDBKeyRange, ...(versions && { versions }) });
}

export const sampleProfile: Profile = {
  id: 'me',
  userId: '3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90',
  nickname: 'Rei',
  goals: { sleepHours: 7.5, workoutsPerWeek: 3, sunMinutes: 20 },
  theme: 'light',
  hideWeight: false,
  createdAt: '2026-10-05T08:00:00.000Z',
};

export const sampleEntry: DailyEntry = {
  date: '2026-10-06',
  pillars: {
    sleep: { hours: 7.5, quality: 4 },
    training: { done: true, type: 'gym', minutes: 60 },
    eating: { rating: 4 },
    sun: { minutes: 25 },
  },
  updatedAt: '2026-10-06T21:00:00.000Z',
};

export const sampleWeighIn: WeighIn = {
  week: '2026-W41',
  weightKg: 78.4,
  measuredOn: '2026-10-11',
  fastingConfirmed: true,
};

export const sampleGroup: Group = {
  id: 'group-1',
  name: 'Gym buddies',
  stake: 'buys the pizza',
  memberIds: ['9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'],
  createdAt: '2026-10-05T09:00:00.000Z',
};

export const sampleFriend: Friend = {
  userId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
  nickname: 'Sam',
  publicKey: 'BFakePublicKey',
  firstSeenAt: '2026-10-11T18:00:00.000Z',
  lastReportAt: '2026-10-11T18:00:00.000Z',
};

export const sampleReport: FriendReport = {
  userId: sampleFriend.userId,
  week: '2026-W41',
  importedAt: '2026-10-11T18:00:00.000Z',
  summary: {
    v: 1,
    uid: sampleFriend.userId,
    nick: 'Sam',
    generatedOn: '2026-10-11',
    week: '2026-W41',
    from: '2026-10-05',
    to: '2026-10-11',
    logged: 6,
    sleepAvg: 7.2,
    sleepOk: 5,
    trainDone: 3,
    trainGoal: 3,
    trainMin: 165,
    cleanOk: 4,
    sunOk: 3,
    weight: 78.4,
    delta: -0.6,
    score: 62,
    prevScore: 34,
    comeback: true,
    pub: 'BFakePublicKey',
    sig: 'FakeSignature',
  },
};

export const sampleNote: Note = {
  id: 'note-1',
  kind: 'plain',
  title: 'Session',
  body: 'We talked about sleep.',
  tag: 'therapy',
  date: '2026-10-08',
  createdAt: '2026-10-08T19:00:00.000Z',
  updatedAt: '2026-10-08T19:00:00.000Z',
};
