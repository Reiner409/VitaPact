import type { CalendarDate } from '@vitapact/core/calendar';
import type { Goals } from '@vitapact/core/pillars';
import { listDailyEntries, type DailyEntry, type VitaPactDatabase } from '@vitapact/core/storage';
import { useCallback, useEffect, useState } from 'react';
import { weekDatesOf, weekDaysOf, type WeekDay } from './weekDays';

/** The days of the current week with their scores; `reload` after a save. */
export function useWeekDays(db: VitaPactDatabase, today: CalendarDate, goals: Goals) {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let current = true;
    const dates = weekDatesOf(today);
    void listDailyEntries(db, dates[0] ?? today, dates[6] ?? today).then((loaded) => {
      if (current) setEntries(loaded);
    });
    return () => {
      current = false;
    };
  }, [db, today, version]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);
  const days: WeekDay[] = weekDaysOf(today, entries, goals);
  return { days, reload };
}
