import { mondayOf, sundayOf } from '@vitapact/core/calendar';
import type { IsoWeek } from '@vitapact/core/calendar';
import { DEFAULT_GOALS, getProfile, getWeighIn, listDailyEntries } from '@vitapact/core/storage';
import type { Goals, VitaPactDatabase } from '@vitapact/core/storage';
import { summarizeWeek, toPillarGoals, type WeekSummary } from './weekSummary';

export interface LoadedWeek {
  readonly summary: WeekSummary;
  readonly goals: ReturnType<typeof toPillarGoals>;
}

/** Reads one week from the local archive; without a profile yet, the default goals apply. */
export async function loadWeek(db: VitaPactDatabase, week: IsoWeek): Promise<LoadedWeek> {
  const [profile, entries, weighIn] = await Promise.all([
    getProfile(db),
    listDailyEntries(db, mondayOf(week), sundayOf(week)),
    getWeighIn(db, week),
  ]);
  const profileGoals: Goals = profile?.goals ?? DEFAULT_GOALS;
  return {
    summary: summarizeWeek(entries, profileGoals, weighIn !== undefined),
    goals: toPillarGoals(profileGoals),
  };
}
