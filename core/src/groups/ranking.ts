import type { IsoWeek } from '../calendar';
import { isComeback, type ReportSummary } from '../report';
import { rankByValue, reportsByMember, type RankingInput, type WaitingRow } from './members';

/** The fields of a weekly report the rankings read; your own report and friends' alike. */
export type RankedReport = Pick<
  ReportSummary,
  'uid' | 'nick' | 'week' | 'score' | 'logged' | 'delta' | 'prevScore'
>;

export interface WeeklyRankedRow {
  kind: 'ranked';
  userId: string;
  isYou: boolean;
  position: number;
  nickname: string;
  score: number;
  logged: number;
  weightDelta?: number;
  /** RF-27: the points gained, present only when the week is a comeback. */
  comebackGain?: number;
}

export type RankingRow = WeeklyRankedRow | WaitingRow;

/** Recomputed from the signed scores, so every device agrees whatever flag a report carries. */
function comebackGain({ score, prevScore }: RankedReport): number | undefined {
  return prevScore !== undefined && isComeback(score, prevScore) ? score - prevScore : undefined;
}

function weeklyRow(report: RankedReport, isYou: boolean): Omit<WeeklyRankedRow, 'position'> {
  const gain = comebackGain(report);
  return {
    kind: 'ranked',
    userId: report.uid,
    isYou,
    nickname: report.nick,
    score: report.score,
    logged: report.logged,
    ...(report.delta === undefined ? {} : { weightDelta: report.delta }),
    ...(gain === undefined ? {} : { comebackGain: gain }),
  };
}

/**
 * RF-13, RF-14, D31: the group's ranking for one week, worked out from the reports every time.
 * A member without that week's report is waiting, with no score and no penalty.
 */
export function weeklyRanking(input: RankingInput, week: IsoWeek): RankingRow[] {
  const ranked: Omit<WeeklyRankedRow, 'position'>[] = [];
  const waiting: WaitingRow[] = [];
  for (const [userId, reports] of reportsByMember(input, (report) => report.week === week)) {
    const isYou = userId === input.ownUserId;
    const [report] = reports;
    if (report) ranked.push(weeklyRow(report, isYou));
    else waiting.push({ kind: 'waiting', userId, isYou });
  }
  return [...rankByValue(ranked, (row) => row.score), ...waiting];
}
