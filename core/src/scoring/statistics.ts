import { previousWeek } from '../calendar';
import type { IsoWeek } from '../calendar';
import { pillarRegistry } from '../pillars';
import type { DayValues, Goals, Pillar, PillarRegistry } from '../pillars';
import { daysOnGoal } from './score';

export interface PillarStatistics {
  /** Average of the pillar's summary field over the days that have it; null if none does. */
  readonly average: number | null;
  readonly total: number;
  readonly daysOnGoal: number;
}

export interface WeekStatistics {
  readonly logged: number;
  readonly pillars: Readonly<Record<string, PillarStatistics>>;
}

export interface WeighInWeight {
  readonly week: IsoWeek;
  readonly weightKg: number;
}

export interface WeightPoint {
  readonly week: IsoWeek;
  /** Null for a week without a weigh-in, so the chart shows a gap instead of a drop to zero. */
  readonly weightKg: number | null;
}

/** RF-08: averages, totals and days on goal of each pillar for the logged days of a week. */
export function weekStatistics(
  days: readonly DayValues[],
  goals: Goals,
  pillars: PillarRegistry = pillarRegistry,
): WeekStatistics {
  return {
    logged: days.length,
    pillars: Object.fromEntries(
      pillars.list().map((pillar) => [pillar.id, pillarStatistics(pillar, days, goals)]),
    ),
  };
}

function pillarStatistics(
  pillar: Pillar,
  days: readonly DayValues[],
  goals: Goals,
): PillarStatistics {
  const values = days.flatMap((day) => {
    const value = day[pillar.id]?.[pillar.summaryField];
    return typeof value === 'number' ? [value] : [];
  });
  const total = values.reduce((sum, value) => sum + value, 0);
  return {
    average: values.length > 0 ? total / values.length : null,
    total,
    daysOnGoal: daysOnGoal(pillar, days, goals),
  };
}

/** RF-08: the weight chart covers the last 12 weeks. */
export const WEIGHT_SERIES_WEEKS = 12;

/**
 * RF-08: one point for each of the 12 weeks ending with `lastWeek`, oldest first, so a week
 * without a weigh-in keeps its place in the chart as a gap.
 */
export function weightSeries(lastWeek: IsoWeek, weighIns: readonly WeighInWeight[]): WeightPoint[] {
  const weightByWeek = new Map(weighIns.map((weighIn) => [weighIn.week, weighIn.weightKg]));
  return weeksEndingWith(lastWeek).map((week) => ({
    week,
    weightKg: weightByWeek.get(week) ?? null,
  }));
}

function weeksEndingWith(lastWeek: IsoWeek): IsoWeek[] {
  const weeks: IsoWeek[] = [];
  for (let week = lastWeek; weeks.length < WEIGHT_SERIES_WEEKS; week = previousWeek(week)) {
    weeks.push(week);
  }
  return weeks.reverse();
}
