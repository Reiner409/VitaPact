import { describe, expect, it } from 'vitest';
import { deleteAllData } from './deleteAllData';
import { TABLE_NAMES } from './schema';
import {
  openTestDatabase,
  sampleEntry,
  sampleFriend,
  sampleGroup,
  sampleNote,
  sampleProfile,
  sampleReport,
  sampleWeighIn,
} from './testing';

describe('F3-ST-04 RF-20 delete all data', () => {
  it('empties every table', async () => {
    const db = await openTestDatabase();
    await db.profile.put(sampleProfile);
    await db.groups.put(sampleGroup);
    await db.dailyEntries.put(sampleEntry);
    await db.weighIns.put(sampleWeighIn);
    await db.friends.put(sampleFriend);
    await db.friendReports.put(sampleReport);
    await db.notes.put(sampleNote);

    const countRows = () => Promise.all(TABLE_NAMES.map((name) => db.table(name).count()));
    expect(await countRows()).not.toContain(0);

    await deleteAllData(db);

    expect(await countRows()).toEqual(TABLE_NAMES.map(() => 0));
  });
});
