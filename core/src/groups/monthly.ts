import { monthOfWeek } from '../calendar';
import {
  latestReport,
  rankByValue,
  reportsByMember,
  type RankingInput,
  type WaitingRow,
} from './members';
import type { RankedReport } from './ranking';

export interface MonthlyRankedRow {
  kind: 'ranked';
  userId: string;
  isYou: boolean;
  position: number;
  nickname: string;
  /** The average of the month's weekly scores, to one decimal. */
  average: number;
  weeks: number;
}

export type MonthlyRankingRow = MonthlyRankedRow | WaitingRow;

function averageOf(scores: readonly number[]): number {
  const total = scores.reduce((sum, score) => sum + score, 0);
  return Math.round((total / scores.length) * 10) / 10;
}

function monthlyRow(
  userId: string,
  isYou: boolean,
  reports: readonly RankedReport[],
): Omit<MonthlyRankedRow, 'position'> | undefined {
  const latest = latestReport(reports);
  if (latest === undefined) return undefined;
  const scores = reports.map((report) => report.score);
  return {
    kind: 'ranked',
    userId,
    isYou,
    nickname: latest.nick,
    average: averageOf(scores),
    weeks: scores.length,
  };
}

/**
 * RF-26, D30: the group's ranking for a month (`YYYY-MM`), the average of each member's weekly
 * scores. A week counts in the month of its Sunday, so each month starts again from zero.
 */
export function monthlyRanking(input: RankingInput, month: string): MonthlyRankingRow[] {
  const ranked: Omit<MonthlyRankedRow, 'position'>[] = [];
  const waiting: WaitingRow[] = [];
  const inMonth = (report: RankedReport) => monthOfWeek(report.week) === month;
  for (const [userId, reports] of reportsByMember(input, inMonth)) {
    const isYou = userId === input.ownUserId;
    const row = monthlyRow(userId, isYou, reports);
    if (row) ranked.push(row);
    else waiting.push({ kind: 'waiting', userId, isYou });
  }
  return [...rankByValue(ranked, (row) => row.average), ...waiting];
}
