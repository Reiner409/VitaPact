import type { VitaPactDatabase } from './database';
import type { DailyEntry, IsoDate } from './records';

/** Saving the same day again replaces the whole entry: there is one entry per day. */
export async function saveDailyEntry(db: VitaPactDatabase, entry: DailyEntry): Promise<void> {
  await db.dailyEntries.put(entry);
}

export const getDailyEntry = (
  db: VitaPactDatabase,
  date: IsoDate,
): Promise<DailyEntry | undefined> => db.dailyEntries.get(date);

/** Entries from `from` to `to`, both included, oldest first. */
export const listDailyEntries = (
  db: VitaPactDatabase,
  from: IsoDate,
  to: IsoDate,
): Promise<DailyEntry[]> => db.dailyEntries.where('date').between(from, to, true, true).toArray();
