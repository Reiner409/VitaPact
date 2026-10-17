import { previousWeek, type CalendarDate } from '@vitapact/core/calendar';
import type { WeekReportInput } from '@vitapact/core/report';
import type { Profile, WeighIn } from '@vitapact/core/storage';
import type { WeekData } from '../week/useWeekData';

const weightOf = (weighIns: readonly WeighIn[], week: string) =>
  weighIns.find((weighIn) => weighIn.week === week)?.weightKg;

/** RF-10: what the signed report says about the week shown (section 9). */
export function reportInputOf(
  profile: Profile,
  { summary, previous, weighIns }: WeekData,
  generatedOn: CalendarDate,
): WeekReportInput {
  const pillar = (id: string) =>
    summary.statistics.pillars[id] ?? { average: null, total: 0, daysOnGoal: 0 };
  const weightKg = weightOf(weighIns, summary.week);
  const previousWeightKg = weightOf(weighIns, previousWeek(summary.week));
  return {
    userId: profile.userId,
    nickname: profile.nickname,
    hideWeight: profile.hideWeight,
    generatedOn,
    week: summary.week,
    logged: summary.statistics.logged,
    sleepAvg: pillar('sleep').average ?? 0,
    sleepOk: pillar('sleep').daysOnGoal,
    trainDone: pillar('training').daysOnGoal,
    trainGoal: profile.goals.workoutsPerWeek,
    trainMin: pillar('training').total,
    cleanOk: pillar('food').daysOnGoal,
    sunOk: pillar('sun').daysOnGoal,
    ...(weightKg !== undefined && { weightKg }),
    ...(previousWeightKg !== undefined && { previousWeightKg }),
    score: summary.score,
    ...(previous && { prevScore: previous.score }),
  };
}
