import { IDBFactory } from 'fake-indexeddb';
import { describe, expect, it } from 'vitest';
import { getFriend, getFriendReport, saveFriendReport } from './friends';
import { getProfile, saveProfile } from './profile';
import { SCHEMA_VERSION, SCHEMA_VERSIONS, TABLE_NAMES, type SchemaVersion } from './schema';
import {
  openTestDatabase,
  sampleFriend,
  sampleProfile,
  sampleReport,
  sampleWeighIn,
} from './testing';
import { getWeighIn, saveWeighIn } from './weigh-ins';
import type { WeighIn } from './records';

describe('RNF-11 local database', () => {
  it('opens with the seven tables of the data model at the current schema version', async () => {
    const db = await openTestDatabase();

    expect(db.tables.map(({ name }) => name).sort()).toEqual([...TABLE_NAMES].sort());
    expect(db.verno).toBe(SCHEMA_VERSION);
  });

  it('keeps saved data when the app is reopened', async () => {
    const indexedDB = new IDBFactory();
    const first = await openTestDatabase(undefined, indexedDB);
    await saveProfile(first, sampleProfile);
    first.close();

    const reopened = await openTestDatabase(undefined, indexedDB);

    expect(await getProfile(reopened)).toEqual(sampleProfile);
  });
});

describe('RNF-11 schema migration', () => {
  const testVersion2: SchemaVersion = {
    version: 2,
    stores: { weighIns: 'week, measuredOn' },
    upgrade: (transaction) =>
      transaction
        .table<WeighIn & { source?: string }>('weighIns')
        .toCollection()
        .modify((weighIn) => {
          weighIn.source = 'manual';
        })
        .then(() => undefined),
  };

  it('upgrades a version 1 database to a test version 2 without losing data', async () => {
    const indexedDB = new IDBFactory();
    const version1 = await openTestDatabase(SCHEMA_VERSIONS, indexedDB);
    await saveProfile(version1, sampleProfile);
    await saveWeighIn(version1, sampleWeighIn);
    version1.close();

    const version2 = await openTestDatabase([...SCHEMA_VERSIONS, testVersion2], indexedDB);

    expect(version2.verno).toBe(2);
    expect(await getProfile(version2)).toEqual(sampleProfile);
    expect(await getWeighIn(version2, sampleWeighIn.week)).toEqual({
      ...sampleWeighIn,
      source: 'manual',
    });
    expect(await version2.weighIns.where('measuredOn').equals('2026-10-11').count()).toBe(1);
  });
});

describe('RNF-11 interrupted write', () => {
  it('leaves no half-written data when a write fails part way', async () => {
    const db = await openTestDatabase();
    const brokenReport = { ...sampleReport, week: undefined as unknown as string };

    await expect(saveFriendReport(db, sampleFriend, brokenReport)).rejects.toThrow();

    expect(await getFriend(db, sampleFriend.userId)).toBeUndefined();
    expect(await db.friendReports.count()).toBe(0);
  });

  it('writes the friend and the report together when nothing fails', async () => {
    const db = await openTestDatabase();

    await saveFriendReport(db, sampleFriend, sampleReport);

    expect(await getFriend(db, sampleFriend.userId)).toEqual(sampleFriend);
    expect(await getFriendReport(db, sampleReport.userId, sampleReport.week)).toEqual(sampleReport);
  });
});
