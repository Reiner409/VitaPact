import {
  isSunday,
  isoWeekOf,
  mondayOf,
  previousWeek,
  sundayOf,
  type CalendarDate,
  type IsoWeek,
} from '@vitapact/core/calendar';
import type { RankedReport } from '@vitapact/core/groups';
import { summarizeWeek } from '@vitapact/core/scoring';
import {
  listDailyEntries,
  listWeighIns,
  pillarGoalsOf,
  type DailyEntry,
  type Profile,
  type VitaPactDatabase,
  type WeighIn,
} from '@vitapact/core/storage';

/** Enough weeks for the month of the ranking week and the week before it. */
const WEEKS_FOR_RANKINGS = 6;

/**
 * Reports are sent on Sunday evening, so on Sunday the ranking shows the week ending today and
 * on the other days the week that ended last Sunday.
 */
export function rankingWeekOf(today: CalendarDate): IsoWeek {
  const week = isoWeekOf(today);
  return isSunday(today) ? week : previousWeek(week);
}

const roundToTenth = (value: number) => Math.round(value * 10) / 10;

function weightDelta(weighIns: readonly WeighIn[], week: IsoWeek): number | undefined {
  const weightOf = (of: IsoWeek) => weighIns.find((weighIn) => weighIn.week === of)?.weightKg;
  const now = weightOf(week);
  const before = weightOf(previousWeek(week));
  return now === undefined || before === undefined ? undefined : roundToTenth(now - before);
}

function weeksUpTo(week: IsoWeek, count: number): IsoWeek[] {
  const weeks = [week];
  while (weeks.length < count) weeks.unshift(previousWeek(weeks[0]!));
  return weeks;
}

interface OwnWeek {
  week: IsoWeek;
  entries: DailyEntry[];
}

/** Your weekly figures as a friend's report would carry them (section 9), from your own days. */
export function ownRankedReports(
  profile: Profile,
  weeks: readonly OwnWeek[],
  weighIns: readonly WeighIn[],
): RankedReport[] {
  const goals = pillarGoalsOf(profile.goals);
  const scores = new Map<IsoWeek, number>();
  const reports: RankedReport[] = [];
  for (const { week, entries } of weeks) {
    if (entries.length === 0) continue;
    const weighedIn = weighIns.some((weighIn) => weighIn.week === week);
    const summary = summarizeWeek(week, entries, goals, weighedIn);
    scores.set(week, summary.score);
    const prevScore = scores.get(previousWeek(week));
    const delta = weightDelta(weighIns, week);
    reports.push({
      uid: profile.userId,
      nick: profile.nickname,
      week,
      score: summary.score,
      logged: summary.statistics.logged,
      ...(prevScore !== undefined && { prevScore }),
      ...(delta !== undefined && { delta }),
    });
  }
  return reports;
}

/** Loads your days of the last weeks up to the ranking week and turns them into reports. */
export async function loadOwnReports(
  db: VitaPactDatabase,
  profile: Profile,
  rankingWeek: IsoWeek,
): Promise<RankedReport[]> {
  const weeks = weeksUpTo(rankingWeek, WEEKS_FOR_RANKINGS);
  const [entries, weighIns] = await Promise.all([
    listDailyEntries(db, mondayOf(weeks[0]!), sundayOf(rankingWeek)),
    listWeighIns(db),
  ]);
  const byWeek = weeks.map((week) => ({
    week,
    entries: entries.filter((entry) => isoWeekOf(entry.date) === week),
  }));
  return ownRankedReports(profile, byWeek, weighIns);
}
