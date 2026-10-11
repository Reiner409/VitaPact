import { Dexie, type Table } from 'dexie';
import type { Note } from './notes/note';
import type { DailyEntry, Friend, FriendReport, Group, IsoWeek, Profile, WeighIn } from './records';
import { SCHEMA_VERSIONS, type SchemaVersion } from './schema';

export type VitaPactDatabase = Dexie & {
  profile: Table<Profile, string>;
  groups: Table<Group, string>;
  dailyEntries: Table<DailyEntry, string>;
  weighIns: Table<WeighIn, IsoWeek>;
  friends: Table<Friend, string>;
  friendReports: Table<FriendReport, [string, IsoWeek]>;
  notes: Table<Note, string>;
};

export interface DatabaseOptions {
  name?: string;
  /** Another IndexedDB implementation, e.g. fake-indexeddb in tests. */
  indexedDB?: IDBFactory;
  IDBKeyRange?: typeof IDBKeyRange;
  /** Tests pass extra versions to exercise a migration. */
  versions?: readonly SchemaVersion[];
}

export const DATABASE_NAME = 'vitapact';

function declareVersions(db: Dexie, versions: readonly SchemaVersion[]) {
  for (const { version, stores, upgrade } of versions) {
    const declared = db.version(version).stores(stores);
    if (upgrade) declared.upgrade(upgrade);
  }
}

export async function openDatabase(options: DatabaseOptions = {}): Promise<VitaPactDatabase> {
  const db = new Dexie(options.name ?? DATABASE_NAME, {
    ...(options.indexedDB && { indexedDB: options.indexedDB }),
    ...(options.IDBKeyRange && { IDBKeyRange: options.IDBKeyRange }),
    // WebView2 relaxes durability by default; a sudden shutdown must not lose a saved day (RNF-11).
    chromeTransactionDurability: 'strict',
  });
  declareVersions(db, options.versions ?? SCHEMA_VERSIONS);
  await db.open();
  return db as VitaPactDatabase;
}
