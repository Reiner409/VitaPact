import { addDays, mondayOf, type CalendarDate, type IsoWeek } from '../calendar';
import type { DayValues, Goals } from '../pillars';
import { dayScore, weekScore } from './score';
import { weekStatistics, type WeekStatistics } from './statistics';
import { verdictBand, type VerdictBand } from './verdict';
import type { DailyEntry } from '../storage';

export interface WeekDaySummary {
  date: CalendarDate;
  /** `null` when the day was not logged. */
  values: DayValues | null;
  score: number | null;
}

export interface WeekSummary {
  week: IsoWeek;
  days: WeekDaySummary[];
  score: number;
  band: VerdictBand;
  statistics: WeekStatistics;
}

/** Storage may hold `null` for an empty field; scoring reads only answered fields. */
export function dayValuesOf(entry: DailyEntry): DayValues {
  return Object.fromEntries(
    Object.entries(entry.pillars).map(([pillar, values]) => [
      pillar,
      Object.fromEntries(Object.entries(values).filter(([, value]) => value !== null)),
    ]),
  ) as DayValues;
}

/** RF-08, RF-09: the score, verdict, statistics and seven days of a week. */
export function summarizeWeek(
  week: IsoWeek,
  entries: readonly DailyEntry[],
  goals: Goals,
  weighedIn: boolean,
): WeekSummary {
  const byDate = new Map(entries.map((entry) => [entry.date, dayValuesOf(entry)]));
  const monday = mondayOf(week);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(monday, index);
    const values = byDate.get(date) ?? null;
    return { date, values, score: values ? dayScore(values, goals) : null };
  });
  const logged = days.flatMap(({ values }) => (values ? [values] : []));
  const score = weekScore({ days: logged, goals, weighedIn });
  return { week, days, score, band: verdictBand(score), statistics: weekStatistics(logged, goals) };
}
