import { mondayOf, previousWeek, sundayOf, type IsoWeek } from '@vitapact/core/calendar';
import type { Goals } from '@vitapact/core/pillars';
import {
  listDailyEntries,
  listWeighIns,
  type DailyEntry,
  type VitaPactDatabase,
  type WeighIn,
} from '@vitapact/core/storage';
import { useEffect, useState } from 'react';
import { summarizeWeek, type WeekSummary } from './weekSummary';

export interface WeekData {
  summary: WeekSummary;
  /** The week before, for the report's comeback; undefined when nothing was logged. */
  previous: WeekSummary | undefined;
  weighIns: WeighIn[];
}

const entriesOf = (db: VitaPactDatabase, week: IsoWeek) =>
  listDailyEntries(db, mondayOf(week), sundayOf(week));

const hasWeighIn = (weighIns: readonly WeighIn[], week: IsoWeek) =>
  weighIns.some((weighIn) => weighIn.week === week);

function weekDataOf(
  week: IsoWeek,
  goals: Goals,
  [entries, previousEntries, weighIns]: [DailyEntry[], DailyEntry[], WeighIn[]],
): WeekData {
  const before = previousWeek(week);
  return {
    summary: summarizeWeek(week, entries, goals, hasWeighIn(weighIns, week)),
    previous:
      previousEntries.length > 0
        ? summarizeWeek(before, previousEntries, goals, hasWeighIn(weighIns, before))
        : undefined,
    weighIns,
  };
}

/** Loads the week shown, the week before it and every weigh-in for the chart. */
export function useWeekData(db: VitaPactDatabase, week: IsoWeek, goals: Goals) {
  const [data, setData] = useState<WeekData | undefined>();
  const goalsKey = JSON.stringify(goals);

  useEffect(() => {
    let current = true;
    void Promise.all([
      entriesOf(db, week),
      entriesOf(db, previousWeek(week)),
      listWeighIns(db),
    ]).then((loaded) => {
      if (current) setData(weekDataOf(week, JSON.parse(goalsKey) as Goals, loaded));
    });
    return () => {
      current = false;
    };
  }, [db, week, goalsKey]);

  return data;
}
