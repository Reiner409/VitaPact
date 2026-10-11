import type { VitaPactDatabase } from '../database';
import type { Profile, Timestamp } from '../records';
import { SCHEMA_VERSION, TABLE_NAMES, type TableName } from '../schema';
import { ROW_CHECKS } from './records-shape';
import { isRecord } from '../validation/shape';

export const BACKUP_FORMAT = 'vitapact-backup';

export type BackupTables = Record<TableName, unknown[]>;

export interface BackupFile {
  format: typeof BACKUP_FORMAT;
  schemaVersion: number;
  exportedAt: Timestamp;
  tables: BackupTables;
}

/** Turns the tables of a file written at version `from` into those of version `from + 1`. */
export interface BackupUpgrade {
  from: number;
  upgrade: (tables: BackupTables) => BackupTables;
}

export interface BackupHistory {
  version: number;
  upgrades: readonly BackupUpgrade[];
}

export const BACKUP_HISTORY: BackupHistory = { version: SCHEMA_VERSION, upgrades: [] };

export type ImportOutcome =
  { ok: true } | { ok: false; reason: 'damaged' | 'unknownVersion' | 'otherUser' };

const DAMAGED: ImportOutcome = { ok: false, reason: 'damaged' };
const UNKNOWN_VERSION: ImportOutcome = { ok: false, reason: 'unknownVersion' };
const OTHER_USER: ImportOutcome = { ok: false, reason: 'otherUser' };

/** Years of daily use fit easily; anything larger is not a file this app wrote. */
export const MAX_BACKUP_LENGTH = 10_000_000;
export const MAX_ROWS_PER_TABLE = 50_000;

/** The signing keys never leave the device (G8.3), so the exported profile has none. */
function withoutSecrets({ signingKeys: _signingKeys, ...profile }: Profile) {
  return profile;
}

async function readTables(db: VitaPactDatabase): Promise<BackupTables> {
  const rows = await Promise.all(TABLE_NAMES.map((name) => db.table(name).toArray()));
  const tables = Object.fromEntries(TABLE_NAMES.map((name, index) => [name, rows[index]]));
  return {
    ...tables,
    profile: (tables['profile'] as Profile[]).map(withoutSecrets),
  } as BackupTables;
}

/** Every table as one JSON text, ready to be saved to a file the user picks (RF-19). */
export async function exportData(db: VitaPactDatabase, exportedAt: Timestamp): Promise<string> {
  const tables = await db.transaction('r', TABLE_NAMES, () => readTables(db));
  const file: BackupFile = {
    format: BACKUP_FORMAT,
    schemaVersion: SCHEMA_VERSION,
    exportedAt,
    tables,
  };
  return JSON.stringify(file, null, 2);
}

export async function hasStoredData(db: VitaPactDatabase): Promise<boolean> {
  const counts = await Promise.all(TABLE_NAMES.map((name) => db.table(name).count()));
  return counts.some((count) => count > 0);
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function hasBackupLayout(value: unknown): value is BackupFile {
  return (
    isRecord(value) &&
    value['format'] === BACKUP_FORMAT &&
    Number.isInteger(value['schemaVersion']) &&
    isRecord(value['tables'])
  );
}

function upgradeToCurrent(file: BackupFile, history: BackupHistory): BackupTables | undefined {
  let tables = file.tables;
  for (let version = file.schemaVersion; version < history.version; version += 1) {
    const step = history.upgrades.find(({ from }) => from === version);
    if (!step) return undefined;
    tables = step.upgrade(tables);
  }
  return tables;
}

/** Upgrades run on untrusted content, so any failure inside them means a damaged file. */
function safelyUpgraded(file: BackupFile, history: BackupHistory): BackupTables | ImportOutcome {
  try {
    return upgradeToCurrent(file, history) ?? UNKNOWN_VERSION;
  } catch {
    return DAMAGED;
  }
}

const isOutcome = (value: BackupTables | ImportOutcome): value is ImportOutcome => 'ok' in value;

function areValid(tables: BackupTables): boolean {
  const tablesValid = TABLE_NAMES.every((name) => {
    const rows = tables[name];
    return Array.isArray(rows) && rows.length <= MAX_ROWS_PER_TABLE && rows.every(ROW_CHECKS[name]);
  });
  return tablesValid && tables.profile.length <= 1;
}

/**
 * This device's identity is never silently replaced: a file must carry a profile when the device
 * has one, and once the device signs reports it accepts only its own user's backup.
 */
function identityConflict(
  current: Profile | undefined,
  imported: Profile[],
): ImportOutcome | undefined {
  if (!current) return undefined;
  if (imported.length !== 1) return DAMAGED;
  const [importedProfile] = imported;
  if (current.signingKeys && importedProfile?.userId !== current.userId) return OTHER_USER;
  return undefined;
}

/**
 * The file never holds signing keys. Restoring on the device that made it keeps the device's keys;
 * on a new device the profile has none, F2-09 creates new ones and friends see a key change.
 */
async function replaceAllData(db: VitaPactDatabase, tables: BackupTables): Promise<ImportOutcome> {
  return db.transaction('rw', TABLE_NAMES, async () => {
    const current = await db.profile.toCollection().first();
    const imported = tables.profile as Profile[];
    const conflict = identityConflict(current, imported);
    if (conflict) return conflict;
    for (const name of TABLE_NAMES) await db.table(name).clear();
    for (const name of TABLE_NAMES) await db.table(name).bulkPut(tables[name]);
    const signingKeys = current?.signingKeys;
    if (signingKeys && imported[0]) await db.profile.put({ ...imported[0], signingKeys });
    return { ok: true } as const;
  });
}

/**
 * Replaces all data with the content of a backup file, but only after the whole file is checked:
 * a damaged, oversized or unknown file, or another user's file, leaves the current data untouched
 * (RF-19).
 */
export async function importData(
  db: VitaPactDatabase,
  text: string,
  history: BackupHistory = BACKUP_HISTORY,
): Promise<ImportOutcome> {
  if (text.length > MAX_BACKUP_LENGTH) return DAMAGED;
  const file = parseJson(text);
  if (!hasBackupLayout(file)) return DAMAGED;
  if (file.schemaVersion < 1 || file.schemaVersion > history.version) return UNKNOWN_VERSION;
  const tables = safelyUpgraded(file, history);
  if (isOutcome(tables)) return tables;
  if (!areValid(tables)) return DAMAGED;
  return replaceAllData(db, tables);
}
