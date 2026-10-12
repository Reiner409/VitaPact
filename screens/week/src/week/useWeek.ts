import type { IsoWeek } from '@vitapact/core/calendar';
import type { Goals, VitaPactDatabase } from '@vitapact/core/storage';
import { useEffect, useState } from 'react';
import { loadWeek } from './loadWeek';
import type { WeekSummary } from './weekSummary';

interface LoadedWeek {
  readonly week: IsoWeek;
  readonly summary: WeekSummary;
}

/** The week's summary, or undefined while it loads; a late answer for another week is dropped. */
export function useWeek(
  db: VitaPactDatabase,
  week: IsoWeek,
  goals: Goals,
): WeekSummary | undefined {
  const [loaded, setLoaded] = useState<LoadedWeek>();
  useEffect(() => {
    let current = true;
    void loadWeek(db, week, goals).then((summary) => {
      if (current) setLoaded({ week, summary });
    });
    return () => {
      current = false;
    };
  }, [db, week, goals]);
  return loaded?.week === week ? loaded.summary : undefined;
}
