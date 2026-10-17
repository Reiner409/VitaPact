import type { VitaPactDatabase } from './database';
import { TABLE_NAMES } from './schema';

/**
 * RF-20: empties every table in one transaction, so a failure leaves the data as it was. The
 * app then starts again from onboarding, because there is no profile.
 */
export async function deleteAllData(db: VitaPactDatabase): Promise<void> {
  const tables = TABLE_NAMES.map((name) => db.table(name));
  await db.transaction('rw', tables, async () => {
    await Promise.all(tables.map((table) => table.clear()));
  });
}
