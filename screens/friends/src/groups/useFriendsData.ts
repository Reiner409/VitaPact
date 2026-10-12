import type { VitaPactDatabase } from '@vitapact/core/storage';
import { useCallback, useEffect, useState } from 'react';
import { loadFriendsData, type FriendsData } from './groupStore';

/** The groups and friends stored on this device; `undefined` while they load. */
export function useFriendsData(db: VitaPactDatabase) {
  const [data, setData] = useState<FriendsData>();

  const reload = useCallback(async () => setData(await loadFriendsData(db)), [db]);

  useEffect(() => {
    let current = true;
    void loadFriendsData(db).then((loaded) => current && setData(loaded));
    return () => {
      current = false;
    };
  }, [db]);

  return { data, reload };
}
