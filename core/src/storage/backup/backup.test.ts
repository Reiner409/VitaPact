import { describe, expect, it } from 'vitest';
import type { VitaPactDatabase } from '../database';
import { saveDailyEntry } from '../daily-entries';
import { saveFriendReport } from '../friends';
import { saveGroup } from '../groups';
import { saveNote, type ProtectedNote } from '../notes';
import { getProfile, saveProfile } from '../profile';
import type { Profile } from '../records';
import { SCHEMA_VERSION, TABLE_NAMES } from '../schema';
import {
  openTestDatabase,
  sampleEntry,
  sampleFriend,
  sampleGroup,
  sampleNote,
  sampleProfile,
  sampleReport,
  sampleWeighIn,
} from '../testing';
import { saveWeighIn } from '../weigh-ins';
import {
  exportData,
  hasStoredData,
  importData,
  MAX_BACKUP_LENGTH,
  MAX_ROWS_PER_TABLE,
  type BackupHistory,
} from './backup';

const EXPORTED_AT = '2026-10-11T20:00:00.000Z';
const SECRET_TEXT = 'what we said in the session';

const protectedNote: ProtectedNote = {
  id: 'note-locked',
  kind: 'protected',
  date: '2026-10-09',
  ciphertext: 'q83vEjRWeJA=',
  iv: 'AAECAwQFBgcICQoL',
  createdAt: '2026-10-09T20:00:00.000Z',
  updatedAt: '2026-10-09T20:00:00.000Z',
};

async function fillDatabase(db: VitaPactDatabase) {
  await saveProfile(db, sampleProfile);
  await saveGroup(db, sampleGroup);
  await saveDailyEntry(db, sampleEntry);
  await saveWeighIn(db, sampleWeighIn);
  await saveFriendReport(db, sampleFriend, sampleReport);
  await saveNote(db, sampleNote);
  await saveNote(db, protectedNote);
}

async function snapshot(db: VitaPactDatabase) {
  const rows = await Promise.all(TABLE_NAMES.map((name) => db.table(name).toArray()));
  return Object.fromEntries(TABLE_NAMES.map((name, index) => [name, rows[index]]));
}

async function clearAll(db: VitaPactDatabase) {
  for (const name of TABLE_NAMES) await db.table(name).clear();
}

const signingKeys = () =>
  crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign', 'verify']);

describe('RF-19 data export', () => {
  it('writes every table with the schema version', async () => {
    const db = await openTestDatabase();
    await fillDatabase(db);

    const file = JSON.parse(await exportData(db, EXPORTED_AT));

    expect(file).toMatchObject({ format: 'vitapact-backup', schemaVersion: SCHEMA_VERSION });
    expect(file.exportedAt).toBe(EXPORTED_AT);
    expect(Object.keys(file.tables).sort()).toEqual([...TABLE_NAMES].sort());
  });

  it('keeps protected notes encrypted, with no plain text in the file', async () => {
    const db = await openTestDatabase();
    await saveNote(db, protectedNote);

    const text = await exportData(db, EXPORTED_AT);

    expect(text).toContain(protectedNote.ciphertext);
    expect(text).not.toContain(SECRET_TEXT);
    expect(JSON.parse(text).tables.notes).toEqual([protectedNote]);
  });

  it('leaves the signing keys out of the file', async () => {
    const db = await openTestDatabase();
    await saveProfile(db, { ...sampleProfile, signingKeys: await signingKeys() });

    const file = JSON.parse(await exportData(db, EXPORTED_AT));

    expect(file.tables.profile).toEqual([sampleProfile]);
    expect(JSON.stringify(file)).not.toMatch(/signingKeys|privateKey/);
  });
});

describe('RF-19 data import', () => {
  it('restores identical data after export, delete and import', async () => {
    const db = await openTestDatabase();
    await fillDatabase(db);
    const before = await snapshot(db);
    const text = await exportData(db, EXPORTED_AT);
    await clearAll(db);

    expect(await importData(db, text)).toEqual({ ok: true });

    expect(await snapshot(db)).toEqual(before);
  });

  it('replaces the data already on the device', async () => {
    const db = await openTestDatabase();
    await fillDatabase(db);
    const text = await exportData(db, EXPORTED_AT);
    await saveGroup(db, { ...sampleGroup, id: 'group-added-later' });

    await importData(db, text);

    expect((await db.groups.toArray()).map(({ id }) => id)).toEqual([sampleGroup.id]);
  });

  it('tells whether there is data that an import would overwrite', async () => {
    const db = await openTestDatabase();
    expect(await hasStoredData(db)).toBe(false);

    await saveGroup(db, sampleGroup);

    expect(await hasStoredData(db)).toBe(true);
  });
});

describe('RF-19 import validation', () => {
  async function expectRejected(text: string, reason: 'damaged' | 'unknownVersion') {
    const db = await openTestDatabase();
    await fillDatabase(db);
    const before = await snapshot(db);

    expect(await importData(db, text)).toEqual({ ok: false, reason });

    expect(await snapshot(db)).toEqual(before);
  }

  async function validFile() {
    const db = await openTestDatabase();
    await fillDatabase(db);
    await saveNote(db, { ...sampleNote, id: 'note-from-file' });
    return JSON.parse(await exportData(db, EXPORTED_AT));
  }

  it('rejects truncated JSON without changing the database', async () => {
    const text = JSON.stringify(await validFile());

    await expectRejected(text.slice(0, text.length / 2), 'damaged');
  });

  it('rejects a file from a future version without changing the database', async () => {
    const file = await validFile();

    await expectRejected(
      JSON.stringify({ ...file, schemaVersion: SCHEMA_VERSION + 1 }),
      'unknownVersion',
    );
  });

  it('rejects a file that is not a VitaPact backup', async () => {
    await expectRejected(JSON.stringify({ hello: 'world' }), 'damaged');
    await expectRejected('[]', 'damaged');
  });

  it('rejects the whole file when a single row is invalid', async () => {
    const file = await validFile();
    file.tables.notes.push({ ...sampleNote, id: 'bad', body: 42 });

    await expectRejected(JSON.stringify(file), 'damaged');
  });

  it('rejects rows with unexpected fields or malformed keys', async () => {
    const extraField = await validFile();
    extraField.tables.groups[0].script = '<script>alert(1)</script>';
    const badDate = await validFile();
    badDate.tables.dailyEntries[0].date = '2026-13-45';
    const badNoteDate = await validFile();
    badNoteDate.tables.notes[0].date = 'yesterday';
    const missingTable = await validFile();
    delete missingTable.tables.friends;

    await expectRejected(JSON.stringify(extraField), 'damaged');
    await expectRejected(JSON.stringify(badDate), 'damaged');
    await expectRejected(JSON.stringify(badNoteDate), 'damaged');
    await expectRejected(JSON.stringify(missingTable), 'damaged');
  });
});

describe('RF-19 import validation against hostile files', () => {
  async function expectDamaged(text: string) {
    const db = await openTestDatabase();
    await fillDatabase(db);
    const before = await snapshot(db);

    expect(await importData(db, text)).toEqual({ ok: false, reason: 'damaged' });

    expect(await snapshot(db)).toEqual(before);
  }

  async function validText() {
    const db = await openTestDatabase();
    await fillDatabase(db);
    return exportData(db, EXPORTED_AT);
  }

  it('rejects rows carrying prototype keys', async () => {
    const text = await validText();
    const groupStart = `"id": "${sampleGroup.id}",`;

    for (const key of ['__proto__', 'constructor', 'prototype', 'toString']) {
      await expectDamaged(text.replace(groupStart, `${groupStart} "${key}": {},`));
    }
  });

  it('rejects pillar keys that are not short camelCase names', async () => {
    const text = await validText();

    for (const key of ['__proto__', 'constructor', 'Bad-Key', 'a'.repeat(40)]) {
      await expectDamaged(text.replace('"sleep": {', `"${key}": {}, "sleep": {`));
    }
  });

  it('rejects an oversized file before reading it', async () => {
    const text = await validText();

    await expectDamaged(text + ' '.repeat(MAX_BACKUP_LENGTH));
  });

  it('rejects a table with too many rows', async () => {
    const file = JSON.parse(await validText());
    file.tables.groups = Array.from({ length: MAX_ROWS_PER_TABLE + 1 }, (_, index) => ({
      ...sampleGroup,
      id: `group-${index}`,
    }));

    await expectDamaged(JSON.stringify(file));
  });

  it('rejects negative goals and a report filed under another friend', async () => {
    const negativeGoal = JSON.parse(await validText());
    negativeGoal.tables.profile[0].goals.sunMinutes = -5;
    const foreignReport = JSON.parse(await validText());
    foreignReport.tables.friendReports[0].userId = 'someone-else';

    await expectDamaged(JSON.stringify(negativeGoal));
    await expectDamaged(JSON.stringify(foreignReport));
  });
});

describe('RF-19 import of an earlier version', () => {
  const renameSunGoal = (profile: Record<string, unknown>) => {
    const { sunMinutesPerDay, ...goals } = profile['goals'] as Record<string, unknown>;
    return { ...profile, goals: { ...goals, sunMinutes: sunMinutesPerDay } };
  };
  const testHistory: BackupHistory = {
    version: SCHEMA_VERSION + 1,
    upgrades: [
      {
        from: SCHEMA_VERSION,
        upgrade: (tables) => ({
          ...tables,
          profile: tables.profile.map((row) => renameSunGoal(row as Record<string, unknown>)),
        }),
      },
    ],
  };

  async function olderFile() {
    const db = await openTestDatabase();
    await fillDatabase(db);
    const file = JSON.parse(await exportData(db, EXPORTED_AT));
    const { sunMinutes, ...goals } = file.tables.profile[0].goals;
    file.tables.profile[0].goals = { ...goals, sunMinutesPerDay: sunMinutes };
    return JSON.stringify(file);
  }

  it('migrates a file from an earlier version before writing it', async () => {
    const db = await openTestDatabase();

    expect(await importData(db, await olderFile(), testHistory)).toEqual({ ok: true });

    expect(await getProfile(db)).toEqual(sampleProfile);
  });

  it('treats an upgrade that fails on the file content as a damaged file', async () => {
    const db = await openTestDatabase();
    const failing: BackupHistory = {
      ...testHistory,
      upgrades: [
        {
          from: SCHEMA_VERSION,
          upgrade: () => {
            throw new TypeError('unexpected content');
          },
        },
      ],
    };

    expect(await importData(db, await olderFile(), failing)).toEqual({
      ok: false,
      reason: 'damaged',
    });
  });

  it('rejects an earlier version with no known way to migrate it', async () => {
    const db = await openTestDatabase();
    const noUpgrades = { ...testHistory, upgrades: [] };

    expect(await importData(db, await olderFile(), noUpgrades)).toEqual({
      ok: false,
      reason: 'unknownVersion',
    });
    expect(await hasStoredData(db)).toBe(false);
  });
});

describe('RF-19 signing keys on import', () => {
  async function deviceWithKeys(profile: Profile) {
    const db = await openTestDatabase();
    const keys = await signingKeys();
    await saveProfile(db, { ...profile, signingKeys: keys });
    return { db, keys };
  }

  it('keeps the device keys when restoring the same user', async () => {
    const { db, keys } = await deviceWithKeys(sampleProfile);
    const text = await exportData(db, EXPORTED_AT);

    await importData(db, text);

    expect((await getProfile(db))?.signingKeys).toEqual(keys);
  });

  it("refuses another user's file once this device signs reports, writing nothing", async () => {
    const { db } = await deviceWithKeys({ ...sampleProfile, userId: 'someone-else' });
    await saveGroup(db, sampleGroup);
    const before = await snapshot(db);
    const source = await openTestDatabase();
    await saveProfile(source, sampleProfile);

    const outcome = await importData(db, await exportData(source, EXPORTED_AT));

    expect(outcome).toEqual({ ok: false, reason: 'otherUser' });
    expect(await snapshot(db)).toEqual(before);
  });

  it("accepts another user's file on a device that has no keys yet", async () => {
    const db = await openTestDatabase();
    await saveProfile(db, { ...sampleProfile, userId: 'someone-else' });
    const source = await openTestDatabase();
    await saveProfile(source, sampleProfile);

    expect(await importData(db, await exportData(source, EXPORTED_AT))).toEqual({ ok: true });
    expect(await getProfile(db)).toEqual(sampleProfile);
  });

  it('refuses a file without a profile when the device has one', async () => {
    const { db } = await deviceWithKeys(sampleProfile);
    const before = await snapshot(db);
    const source = await openTestDatabase();
    await saveGroup(source, sampleGroup);

    const outcome = await importData(db, await exportData(source, EXPORTED_AT));

    expect(outcome).toEqual({ ok: false, reason: 'damaged' });
    expect(await snapshot(db)).toEqual(before);
  });
});
