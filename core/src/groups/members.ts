import type { IsoWeek } from '../calendar';
import type { RankedReport } from './ranking';

export interface RankingInput {
  readonly memberIds: readonly string[];
  readonly ownUserId: string;
  /** Any reports at hand, of any week and any author: the ranking picks what it needs. */
  readonly reports: readonly RankedReport[];
}

export interface WaitingRow {
  kind: 'waiting';
  userId: string;
  isYou: boolean;
}

/** RF-13: You are in every group you keep, even when it lists only friends. */
export function rankingMembers({ memberIds, ownUserId }: RankingInput): string[] {
  return [...new Set([ownUserId, ...memberIds])];
}

export function latestReport(reports: readonly RankedReport[]): RankedReport | undefined {
  return reports.reduce<RankedReport | undefined>(
    (latest, report) => (latest === undefined || report.week > latest.week ? report : latest),
    undefined,
  );
}

/**
 * G9.2: author ids come from friends' reports, so they are grouped in a `Map`. A week imported
 * twice counts once, the later report replacing the earlier as it does in storage.
 */
export function reportsByMember(
  input: RankingInput,
  belongs: (report: RankedReport) => boolean,
): Map<string, RankedReport[]> {
  const byMember = new Map(
    rankingMembers(input).map((userId) => [userId, new Map<IsoWeek, RankedReport>()]),
  );
  for (const report of input.reports) {
    if (belongs(report)) byMember.get(report.uid)?.set(report.week, report);
  }
  return new Map([...byMember].map(([userId, weeks]) => [userId, [...weeks.values()]]));
}

/**
 * Highest value first; equal values share a position (1, 1, 3) and are listed by user id, so
 * every device shows the same order whatever order the reports were imported in.
 */
export function rankByValue<T extends { userId: string }>(
  rows: readonly T[],
  valueOf: (row: T) => number,
): (T & { position: number })[] {
  const sorted = [...rows].sort(
    (a, b) => valueOf(b) - valueOf(a) || (a.userId < b.userId ? -1 : 1),
  );
  return sorted.map((row) => ({
    ...row,
    position: 1 + sorted.filter((other) => valueOf(other) > valueOf(row)).length,
  }));
}
