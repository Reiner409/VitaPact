import type { CalendarDate } from '@vitapact/core/calendar';
import type { DayValues, FieldValue } from '@vitapact/core/pillars';
import { getDailyEntry, type VitaPactDatabase } from '@vitapact/core/storage';
import { useCallback, useEffect, useState } from 'react';
import { dayValuesOf } from './dayValues';

export interface DayValuesState {
  values: DayValues;
  setField: (pillar: string, field: string, value: FieldValue | undefined) => void;
  /** True once a value changed since the day was loaded or last saved. */
  changed: boolean;
  markSaved: () => void;
}

/** The values of the day being logged, starting from what was saved for it, if anything. */
export function useDayValues(db: VitaPactDatabase, date: CalendarDate): DayValuesState {
  const [values, setValues] = useState<DayValues>({});
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    let current = true;
    void getDailyEntry(db, date).then((entry) => {
      if (!current) return;
      setValues(dayValuesOf(entry));
      setChanged(false);
    });
    return () => {
      current = false;
    };
  }, [db, date]);

  const setField = useCallback((pillar: string, field: string, value: FieldValue | undefined) => {
    setValues((day) => ({ ...day, [pillar]: { ...day[pillar], [field]: value } }));
    setChanged(true);
  }, []);
  const markSaved = useCallback(() => setChanged(false), []);
  return { values, setField, changed, markSaved };
}
