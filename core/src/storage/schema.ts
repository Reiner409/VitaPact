import type { Transaction } from 'dexie';

export const TABLE_NAMES = [
  'profile',
  'groups',
  'dailyEntries',
  'weighIns',
  'friends',
  'friendReports',
  'notes',
] as const;

export type TableName = (typeof TABLE_NAMES)[number];

/**
 * One step of the database history. Dexie keeps every step so an old database is upgraded one
 * version at a time; a new version adds an entry here and never edits an earlier one.
 */
export interface SchemaVersion {
  version: number;
  stores: Partial<Record<TableName, string | null>>;
  upgrade?: (transaction: Transaction) => Promise<void>;
}

export const SCHEMA_VERSIONS: readonly SchemaVersion[] = [
  {
    version: 1,
    stores: {
      profile: 'id',
      groups: 'id',
      dailyEntries: 'date',
      weighIns: 'week',
      friends: 'userId',
      friendReports: '[userId+week], week, userId',
      notes: 'id, date',
    },
  },
];

export const latestVersionOf = (versions: readonly SchemaVersion[]) =>
  Math.max(...versions.map(({ version }) => version));

export const SCHEMA_VERSION = latestVersionOf(SCHEMA_VERSIONS);
