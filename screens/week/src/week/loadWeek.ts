import { mondayOf, sundayOf } from '@vitapact/core/calendar';
import type { IsoWeek } from '@vitapact/core/calendar';
import { getWeighIn, listDailyEntries } from '@vitapact/core/storage';
import type { Goals, VitaPactDatabase } from '@vitapact/core/storage';
import { summarizeWeek, type WeekSummary } from './weekSummary';

/** Reads one week's check-ins and weigh-in from the local archive and scores them. */
export async function loadWeek(
  db: VitaPactDatabase,
  week: IsoWeek,
  goals: Goals,
): Promise<WeekSummary> {
  const [entries, weighIn] = await Promise.all([
    listDailyEntries(db, mondayOf(week), sundayOf(week)),
    getWeighIn(db, week),
  ]);
  return summarizeWeek(entries, goals, weighIn !== undefined);
}
