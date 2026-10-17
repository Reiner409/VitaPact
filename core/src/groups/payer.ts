import { monthOfWeek, previousWeek, type IsoWeek } from '../calendar';
import { isComeback } from '../report';
import { reportsByMember, type RankingInput } from './members';
import type { RankedReport } from './ranking';

/** How many phrases each version has; they live in the translation files (section 9.1). */
export interface PhraseCounts {
  friends: number;
  payer: number;
}

/** Who pays this weekend and which phrase announces it, 0-based in each version's list. */
export interface WeekendPayer {
  userId: string;
  friendsPhrase: number;
  payerPhrase: number;
}

/** How far back the chain of weekends is followed to know who paid the previous one. */
export const PAYER_HISTORY_WEEKS = 104;

/** FNV-1a: the same text gives the same number on every device. */
function stableHash(text: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}

/** Section 9.1: from the week and who pays, moved on by one if it matches last weekend's. */
function phraseIndex(week: IsoWeek, userId: string, count: number, previous?: number): number {
  const index = stableHash(`${week}|${userId}`) % count;
  return index === previous ? (index + 1) % count : index;
}

/** A comeback this month keeps someone from paying until the month ends (section 2, point 7). */
function onComebackThisMonth(reports: readonly RankedReport[], week: IsoWeek): boolean {
  const month = monthOfWeek(week);
  return reports.some(
    (report) =>
      report.week <= week &&
      monthOfWeek(report.week) === month &&
      isComeback(report.score, report.prevScore),
  );
}

/**
 * RF-26: among the members with a report for the week, leaving out last weekend's payer and
 * anyone on a comeback, the lowest score pays; a tie goes to fewer days logged; a tie on both,
 * or nobody left, means nobody pays.
 */
function payerOfWeek(input: RankingInput, week: IsoWeek, lastPayer?: string): string | undefined {
  const candidates = [...reportsByMember(input, () => true)].flatMap(([userId, reports]) => {
    const report = reports.find((candidate) => candidate.week === week);
    if (!report || userId === lastPayer || onComebackThisMonth(reports, week)) return [];
    return [{ userId, score: report.score, logged: report.logged }];
  });
  const lowest = Math.min(...candidates.map(({ score }) => score));
  const atLowest = candidates.filter(({ score }) => score === lowest);
  const fewest = Math.min(...atLowest.map(({ logged }) => logged));
  const chosen = atLowest.filter(({ logged }) => logged === fewest);
  return chosen.length === 1 ? chosen[0]?.userId : undefined;
}

/** The weeks from the oldest report in reach up to the given one, oldest first. */
function weeksUpTo(input: RankingInput, week: IsoWeek): IsoWeek[] {
  const weeks: IsoWeek[] = [week];
  const oldest = input.reports.reduce((min, { week: of }) => (of < min ? of : min), week);
  while (weeks.length < PAYER_HISTORY_WEEKS && (weeks[0] ?? week) > oldest) {
    weeks.unshift(previousWeek(weeks[0] ?? week));
  }
  return weeks;
}

/**
 * RF-26, D19: who pays the weekend that ends the given week, the same on every device with the
 * same reports and members. The weekends before it are worked out in order, so last weekend's
 * payer and last weekend's phrases are known without being stored anywhere.
 */
export function weekendPayer(
  input: RankingInput,
  week: IsoWeek,
  counts: PhraseCounts,
): WeekendPayer | undefined {
  let last: WeekendPayer | undefined;
  for (const of of weeksUpTo(input, week)) {
    const userId = payerOfWeek(input, of, last?.userId);
    last = userId
      ? {
          userId,
          friendsPhrase: phraseIndex(of, userId, counts.friends, last?.friendsPhrase),
          payerPhrase: phraseIndex(of, userId, counts.payer, last?.payerPhrase),
        }
      : undefined;
  }
  return last;
}
