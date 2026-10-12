import type { IsoWeek } from '@vitapact/core/calendar';
import type { VitaPactDatabase } from '@vitapact/core/storage';
import { useEffect, useState } from 'react';
import { loadWeek, type LoadedWeek } from './loadWeek';

interface WeekState {
  readonly week: IsoWeek;
  readonly loaded: LoadedWeek;
}

/** The loaded week, or undefined while it loads; a late answer for another week is dropped. */
export function useWeek(db: VitaPactDatabase, week: IsoWeek): LoadedWeek | undefined {
  const [state, setState] = useState<WeekState>();
  useEffect(() => {
    let current = true;
    void loadWeek(db, week).then((loaded) => {
      if (current) setState({ week, loaded });
    });
    return () => {
      current = false;
    };
  }, [db, week]);
  return state?.week === week ? state.loaded : undefined;
}
