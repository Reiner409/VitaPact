import type { IsoWeek } from '@vitapact/core/calendar';
import { weeksEndingWith } from '@vitapact/core/scoring';
import type { FriendReport } from '@vitapact/core/storage';

export interface HistoryPoint {
  week: IsoWeek;
  value: number | null;
}

/** RF-13: one value per week of the last 12, `null` where the friend sent no report or no weight. */
export function historyOf(
  reports: readonly FriendReport[],
  lastWeek: IsoWeek,
  valueOf: (report: FriendReport) => number | undefined,
): HistoryPoint[] {
  const byWeek = new Map(reports.map((report) => [report.week, report]));
  return weeksEndingWith(lastWeek).map((week) => {
    const report = byWeek.get(week);
    return { week, value: (report && valueOf(report)) ?? null };
  });
}

export const scoreOf = (report: FriendReport) => report.summary.score;
export const weightOf = (report: FriendReport) => report.summary.weight;
