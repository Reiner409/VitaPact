import type { CalendarDate } from '@vitapact/core/calendar';
import { pillarRegistry, type DayValues } from '@vitapact/core/pillars';
import { saveDailyEntry, type VitaPactDatabase } from '@vitapact/core/storage';
import { useState } from 'react';
import { dayEntryOf } from './dayEntry';

export type SaveNotice = 'saved' | 'failed' | null;

/** Saves the day; a new save of the same day replaces the old one (RF-03). */
export function useSaveDay(db: VitaPactDatabase, onSaved: () => void, now: () => Date) {
  const [triedToSave, setTriedToSave] = useState(false);
  const [notice, setNotice] = useState<SaveNotice>(null);

  const save = async (date: CalendarDate, values: DayValues) => {
    setTriedToSave(true);
    const entry = dayEntryOf(pillarRegistry.list(), values, date, now());
    if (!entry) return;
    try {
      await saveDailyEntry(db, entry);
      setTriedToSave(false);
      setNotice('saved');
      onSaved();
    } catch {
      setNotice('failed');
    }
  };
  return { triedToSave, notice, closeNotice: () => setNotice(null), save };
}
