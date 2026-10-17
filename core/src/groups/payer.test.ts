import { describe, expect, it } from 'vitest';
import { previousWeek, type IsoWeek } from '../calendar';
import type { RankedReport } from './ranking';
import { weekendPayer, type PhraseCounts } from './payer';

const counts: PhraseCounts = { friends: 12, payer: 6 };
const you = '00000000-0000-4000-8000-000000000000';
const ana = 'a0000000-0000-4000-8000-000000000001';
const ben = 'b0000000-0000-4000-8000-000000000002';
const cat = 'c0000000-0000-4000-8000-000000000003';

const report = (uid: string, week: IsoWeek, score: number, more: Partial<RankedReport> = {}) => ({
  uid,
  nick: uid.slice(0, 3),
  week,
  score,
  logged: 7,
  ...more,
});

const input = (reports: RankedReport[], memberIds = [ana, ben, cat]) => ({
  memberIds,
  ownUserId: you,
  reports,
});

const W41 = '2026-W41';
const W40 = '2026-W40';

describe('F2-14 RF-26 who pays the weekend', () => {
  it('rule 1: only members with a report for the week can pay', () => {
    const payer = weekendPayer(input([report(ana, W41, 80), report(ben, W41, 70)]), W41, counts);
    expect(payer?.userId).toBe(ben);
  });

  it('rule 2: whoever paid last weekend does not pay again', () => {
    const reports = [
      report(ana, W40, 80),
      report(ben, W40, 50),
      report(ana, W41, 80),
      report(ben, W41, 40),
    ];
    expect(weekendPayer(input(reports), W40, counts)?.userId).toBe(ben);
    expect(weekendPayer(input(reports), W41, counts)?.userId).toBe(ana);
  });

  it('rule 3: someone on a comeback this month does not pay', () => {
    const reports = [report(ana, W41, 66, { prevScore: 40 }), report(ben, W41, 70)];
    expect(weekendPayer(input(reports), W41, counts)?.userId).toBe(ben);
  });

  it('rule 3: the comeback protects for the rest of that month only', () => {
    const october = [report(ana, W41, 66, { prevScore: 40 }), report(ana, '2026-W42', 50)];
    const later = [report(ben, '2026-W42', 70), report(ben, '2026-W45', 70)];
    const reports = [...october, ...later, report(ana, '2026-W45', 50)];
    expect(weekendPayer(input(reports), '2026-W42', counts)?.userId).toBe(ben);
    expect(weekendPayer(input(reports), '2026-W45', counts)?.userId).toBe(ana);
  });

  it('rule 4: the lowest score pays, a tie goes to fewer days logged', () => {
    const reports = [
      report(ana, W41, 60, { logged: 6 }),
      report(ben, W41, 60, { logged: 4 }),
      report(cat, W41, 90),
    ];
    expect(weekendPayer(input(reports), W41, counts)?.userId).toBe(ben);
  });

  it('nobody pays when the tie stays, or when everyone is left out', () => {
    const tie = [report(ana, W41, 60), report(ben, W41, 60)];
    expect(weekendPayer(input(tie), W41, counts)).toBeUndefined();
    const comebacks = [report(ana, W41, 70, { prevScore: 40 })];
    expect(weekendPayer(input(comebacks), W41, counts)).toBeUndefined();
    expect(weekendPayer(input([]), W41, counts)).toBeUndefined();
  });

  it('counts You and ignores people outside the group', () => {
    const reports = [report(you, W41, 30), report(ana, W41, 80), report('stranger', W41, 10)];
    expect(weekendPayer(input(reports), W41, counts)?.userId).toBe(you);
  });

  it('gives the same result on two devices that imported the reports in another order', () => {
    const reports = [
      report(ana, W40, 55),
      report(ben, W40, 60),
      report(cat, W40, 70),
      report(ana, W41, 50),
      report(ben, W41, 65),
      report(cat, W41, 45),
    ];
    const first = weekendPayer(input(reports), W41, counts);
    const second = weekendPayer(input([...reports].reverse(), [cat, ben, ana]), W41, counts);
    expect(second).toEqual(first);
  });

  it('over 52 weeks never picks the same person or the same phrase two weekends in a row', () => {
    const weeks: IsoWeek[] = ['2026-W52'];
    while (weeks.length < 52) weeks.unshift(previousWeek(weeks[0] ?? '2026-W52'));
    // Ana always has the lowest score, so only rule 2 keeps her from paying every weekend.
    const reports = weeks.flatMap((week, index) => [
      report(ana, week, 30),
      report(ben, week, 40 + (index % 3)),
      report(cat, week, 60),
    ]);
    const payers = weeks.map((week) => weekendPayer(input(reports), week, counts));
    for (let index = 1; index < payers.length; index += 1) {
      const [before, now] = [payers[index - 1], payers[index]];
      expect(now?.userId).not.toBe(before?.userId);
      expect(now?.friendsPhrase).not.toBe(before?.friendsPhrase);
      expect(now?.payerPhrase).not.toBe(before?.payerPhrase);
    }
    expect(payers.every((payer) => payer !== undefined)).toBe(true);
  });

  it('keeps every phrase index inside its list', () => {
    const payer = weekendPayer(input([report(ana, W41, 40)]), W41, { friends: 3, payer: 2 });
    expect(payer?.friendsPhrase).toBeLessThan(3);
    expect(payer?.payerPhrase).toBeLessThan(2);
  });
});
