import type { CalendarDate } from '@vitapact/core/calendar';
import type { DayValues, FieldValue } from '@vitapact/core/pillars';
import { getDailyEntry, type VitaPactDatabase } from '@vitapact/core/storage';
import { useCallback, useEffect, useState } from 'react';
import { dayValuesOf } from './dayValues';

export interface DayValuesState {
  values: DayValues;
  setField: (pillar: string, field: string, value: FieldValue | undefined) => void;
}

/** The values of the day being logged, starting from what was saved for it, if anything. */
export function useDayValues(db: VitaPactDatabase, date: CalendarDate): DayValuesState {
  const [values, setValues] = useState<DayValues>({});

  useEffect(() => {
    let current = true;
    void getDailyEntry(db, date).then((entry) => {
      if (current) setValues(dayValuesOf(entry));
    });
    return () => {
      current = false;
    };
  }, [db, date]);

  const setField = useCallback(
    (pillar: string, field: string, value: FieldValue | undefined) =>
      setValues((day) => ({ ...day, [pillar]: { ...day[pillar], [field]: value } })),
    [],
  );
  return { values, setField };
}
