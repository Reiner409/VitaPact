import { pillarRegistry } from '@vitapact/core/pillars';
import type { DayValues, Goals, PillarValues } from '@vitapact/core/pillars';
import { verdictBand, weekScore, weekStatistics } from '@vitapact/core/scoring';
import type { PillarStatistics, VerdictBand } from '@vitapact/core/scoring';
import type { DailyEntry, Goals as ProfileGoals } from '@vitapact/core/storage';

export interface WeekSummary {
  readonly score: number;
  readonly band: VerdictBand;
  readonly logged: number;
  readonly pillars: Readonly<Record<string, PillarStatistics>>;
}

/** RF-08, RF-09: score, verdict band and pillar statistics of the logged days of a week. */
export function summarizeWeek(
  entries: readonly DailyEntry[],
  profileGoals: ProfileGoals,
  weighedIn: boolean,
): WeekSummary {
  const days = entries.map(toDayValues);
  const goals = toPillarGoals(profileGoals);
  const score = weekScore({ days, goals, weighedIn });
  const { logged, pillars } = weekStatistics(days, goals);
  return { score, band: verdictBand(score), logged, pillars };
}

/** The profile stores goals by name; scoring reads them by pillar id. */
export function toPillarGoals(goals: ProfileGoals): Goals {
  return {
    ...pillarRegistry.defaultGoals(),
    sleep: goals.sleepHours,
    training: goals.workoutsPerWeek,
    sun: goals.sunMinutes,
  };
}

/** Storage keeps a skipped field as null; scoring expects it left out. */
function toDayValues(entry: DailyEntry): DayValues {
  return Object.fromEntries(
    Object.entries(entry.pillars).map(([pillarId, values]) => [pillarId, withoutNulls(values)]),
  );
}

function withoutNulls(values: Readonly<Record<string, unknown>>): PillarValues {
  return Object.fromEntries(
    Object.entries(values).filter(
      (entry): entry is [string, number | string | boolean] => entry[1] !== null,
    ),
  );
}
