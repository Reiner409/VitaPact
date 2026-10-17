import type { CalendarDate } from '@vitapact/core/calendar';
import type { Profile, VitaPactDatabase } from '@vitapact/core/storage';
import { useCallback, useEffect, useState } from 'react';
import { loadFriendsData, type FriendsData } from './groupStore';

/** The groups and friends stored on this device; `undefined` while they load. */
export function useFriendsData(
  db: VitaPactDatabase,
  profile: Profile | undefined,
  today: CalendarDate,
) {
  const [data, setData] = useState<FriendsData>();

  const load = useCallback(() => loadFriendsData(db, profile, today), [db, profile, today]);
  const reload = useCallback(async () => setData(await load()), [load]);

  useEffect(() => {
    let current = true;
    void load().then((loaded) => current && setData(loaded));
    return () => {
      current = false;
    };
  }, [load]);

  return { data, reload };
}
