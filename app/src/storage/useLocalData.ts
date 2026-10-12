import { getProfile, type Profile, type VitaPactDatabase } from '@vitapact/core/storage';
import { useCallback, useEffect, useState } from 'react';

export type OpenDatabase = () => Promise<VitaPactDatabase>;

export type LocalData =
  | { status: 'opening' }
  | { status: 'unavailable' }
  | { status: 'ready'; db: VitaPactDatabase; profile: Profile | undefined };

/**
 * Opens the local database once for the whole app and reads the profile, the one record every
 * screen depends on. `reloadProfile` lets a screen that saved the profile refresh the others.
 */
export function useLocalData(openDatabase: OpenDatabase) {
  const [data, setData] = useState<LocalData>({ status: 'opening' });

  useEffect(() => {
    let closed = false;
    let opened: VitaPactDatabase | undefined;
    openDatabase()
      .then(async (db) => {
        // React's strict mode mounts twice; the first connection is closed, not leaked.
        if (closed) return db.close();
        opened = db;
        const profile = await getProfile(db);
        if (!closed) setData({ status: 'ready', db, profile });
      })
      .catch(() => {
        if (!closed) setData({ status: 'unavailable' });
      });
    return () => {
      closed = true;
      opened?.close();
    };
  }, [openDatabase]);

  const reloadProfile = useCallback(async () => {
    if (data.status !== 'ready') return;
    const profile = await getProfile(data.db);
    setData({ ...data, profile });
  }, [data]);

  return { data, reloadProfile };
}
