import { describe, expect, it } from 'vitest';
import {
  friendStanding,
  isWaiting,
  monthlyRanking,
  weeklyRanking,
  type RankedReport,
  type RankingRow,
} from './index';

const ME = 'me';

function report(uid: string, week: string, score: number, extra: Partial<RankedReport> = {}) {
  return { uid, nick: uid.toUpperCase(), week, score, logged: 7, ...extra } satisfies RankedReport;
}

function order(rows: readonly RankingRow[]) {
  return rows.map((row) => (row.kind === 'ranked' ? `${row.position}:${row.userId}` : row.userId));
}

describe('RF-13 weekly ranking', () => {
  const reports = [
    report(ME, '2026-W41', 62),
    report('ana', '2026-W41', 80),
    report('bo', '2026-W41', 45),
    report('ana', '2026-W40', 10),
  ];

  it('ranks the members with a report for the week, highest score first', () => {
    const rows = weeklyRanking({ memberIds: ['ana', 'bo'], ownUserId: ME, reports }, '2026-W41');
    expect(order(rows)).toEqual(['1:ana', '2:me', '3:bo']);
  });

  it('always has a row for You, even when the group lists only friends', () => {
    const rows = weeklyRanking({ memberIds: ['ana'], ownUserId: ME, reports }, '2026-W41');
    expect(rows.filter((row) => row.isYou).map((row) => row.userId)).toEqual([ME]);
  });

  it('shows the nickname, logged days and weight change carried by the report', () => {
    const withWeight = [report('ana', '2026-W41', 80, { logged: 5, delta: -0.6 })];
    const [row] = weeklyRanking(
      { memberIds: ['ana'], ownUserId: ME, reports: withWeight },
      '2026-W41',
    );
    expect(row).toMatchObject({ kind: 'ranked', nickname: 'ANA', logged: 5, weightDelta: -0.6 });
  });

  it('gives equal scores the same position', () => {
    const tied = [
      report(ME, '2026-W41', 70),
      report('ana', '2026-W41', 70),
      report('bo', '2026-W41', 50),
    ];
    const rows = weeklyRanking(
      { memberIds: ['ana', 'bo'], ownUserId: ME, reports: tied },
      '2026-W41',
    );
    expect(order(rows)).toEqual(['1:ana', '1:me', '3:bo']);
  });

  it('ignores reports from people outside the group', () => {
    const rows = weeklyRanking({ memberIds: ['bo'], ownUserId: ME, reports }, '2026-W41');
    expect(order(rows)).toEqual(['1:me', '2:bo']);
  });

  it('ranks a friend in each of their groups from the same reports', () => {
    const office = weeklyRanking({ memberIds: ['ana'], ownUserId: ME, reports }, '2026-W41');
    const friday = weeklyRanking({ memberIds: ['ana', 'bo'], ownUserId: ME, reports }, '2026-W41');
    expect(order(office)).toEqual(['1:ana', '2:me']);
    expect(order(friday)).toEqual(['1:ana', '2:me', '3:bo']);
  });

  it('updates the ranking when a late report arrives, with nothing saved in between', () => {
    const group = { memberIds: ['ana', 'bo', 'cy'], ownUserId: ME };
    const before = weeklyRanking({ ...group, reports }, '2026-W41');
    const after = weeklyRanking(
      { ...group, reports: [...reports, report('cy', '2026-W41', 90)] },
      '2026-W41',
    );
    expect(order(before)).toEqual(['1:ana', '2:me', '3:bo', 'cy']);
    expect(order(after)).toEqual(['1:cy', '2:ana', '3:me', '4:bo']);
  });
});

describe('RF-14 D31 a member without the week report is waiting', () => {
  it('lists them as waiting, with no score, verdict or flag', () => {
    const rows = weeklyRanking(
      { memberIds: ['ana'], ownUserId: ME, reports: [report('ana', '2026-W40', 20)] },
      '2026-W41',
    );
    expect(rows).toEqual([
      { kind: 'waiting', userId: ME, isYou: true },
      { kind: 'waiting', userId: 'ana', isYou: false },
    ]);
  });
});

describe('RF-14 a friend with no report for more than 8 days is waiting', () => {
  const lastWeek = [report('ana', '2026-W40', 20), report('ana', '2026-W41', 55)];

  it('is not waiting on day 8 after the Sunday that ends the last report', () => {
    expect(isWaiting('2026-10-11', '2026-10-19')).toBe(false);
    expect(friendStanding(lastWeek, '2026-10-19')).toEqual({
      kind: 'reporting',
      latest: lastWeek[1],
    });
  });

  it('is waiting from day 9', () => {
    expect(isWaiting('2026-10-11', '2026-10-20')).toBe(true);
    expect(friendStanding(lastWeek, '2026-10-20')).toEqual({ kind: 'waiting' });
  });

  it('counts the days across the turn of the year and a week 53', () => {
    expect(isWaiting('2027-01-03', '2027-01-11')).toBe(false);
    expect(friendStanding([report('ana', '2026-W53', 60)], '2027-01-12')).toEqual({
      kind: 'waiting',
    });
  });

  it('is waiting before any report has arrived', () => {
    expect(isWaiting(undefined, '2026-10-12')).toBe(true);
    expect(friendStanding([], '2026-10-12')).toEqual({ kind: 'waiting' });
  });
});

describe('RF-27 comeback in the ranking', () => {
  function comebackOf(score: number, prevScore: number) {
    const rows = weeklyRanking(
      { memberIds: [], ownUserId: ME, reports: [report(ME, '2026-W41', score, { prevScore })] },
      '2026-W41',
    );
    return rows[0]?.kind === 'ranked' ? rows[0].comebackGain : 'missing';
  }

  it('marks 34 → 62 as a comeback and shows the 28 points gained', () => {
    expect(comebackOf(62, 34)).toBe(28);
  });

  it('does not mark 50 → 70: the previous week was not below 50', () => {
    expect(comebackOf(70, 50)).toBeUndefined();
  });

  it('does not mark 40 → 54: the gain is under 15 points', () => {
    expect(comebackOf(54, 40)).toBeUndefined();
  });

  it('does not mark a first report, which has no previous week', () => {
    const rows = weeklyRanking(
      { memberIds: [], ownUserId: ME, reports: [report(ME, '2026-W41', 90)] },
      '2026-W41',
    );
    expect(rows[0]).not.toHaveProperty('comebackGain');
  });
});

describe('RF-26 D30 monthly ranking', () => {
  it('averages the weekly scores of the month, highest first', () => {
    const reports = [
      report(ME, '2026-W41', 60),
      report(ME, '2026-W42', 71),
      report('ana', '2026-W41', 50),
    ];
    const rows = monthlyRanking({ memberIds: ['ana'], ownUserId: ME, reports }, '2026-10');
    expect(rows).toEqual([
      {
        kind: 'ranked',
        userId: ME,
        isYou: true,
        position: 1,
        nickname: 'ME',
        average: 65.5,
        weeks: 2,
      },
      {
        kind: 'ranked',
        userId: 'ana',
        isYou: false,
        position: 2,
        nickname: 'ANA',
        average: 50,
        weeks: 1,
      },
    ]);
  });

  it('counts a week across two months in the month of its Sunday', () => {
    // 2026-W44 runs from Monday 26 October to Sunday 1 November.
    const reports = [report(ME, '2026-W43', 40), report(ME, '2026-W44', 80)];
    const ownRow = (month: string) =>
      monthlyRanking({ memberIds: [], ownUserId: ME, reports }, month)[0];
    expect(ownRow('2026-10')).toMatchObject({ average: 40, weeks: 1 });
    expect(ownRow('2026-11')).toMatchObject({ average: 80, weeks: 1 });
  });

  it('starts again from zero in a new month, with members waiting', () => {
    const rows = monthlyRanking(
      { memberIds: ['ana'], ownUserId: ME, reports: [report('ana', '2026-W43', 90)] },
      '2026-11',
    );
    expect(rows).toEqual([
      { kind: 'waiting', userId: ME, isYou: true },
      { kind: 'waiting', userId: 'ana', isYou: false },
    ]);
  });

  it('counts a week imported twice once, using the later report', () => {
    const reports = [
      report(ME, '2026-W41', 40),
      report(ME, '2026-W42', 60),
      report(ME, '2026-W41', 80),
    ];
    const [row] = monthlyRanking({ memberIds: [], ownUserId: ME, reports }, '2026-10');
    expect(row).toMatchObject({ average: 70, weeks: 2 });
  });

  it('includes a late report as soon as it is in the list', () => {
    const early = [report(ME, '2026-W41', 60), report('ana', '2026-W41', 70)];
    const late = [...early, report('ana', '2026-W42', 30)];
    const first = (reports: RankedReport[]) =>
      monthlyRanking({ memberIds: ['ana'], ownUserId: ME, reports }, '2026-10')[0]?.userId;
    expect(first(early)).toBe('ana');
    expect(first(late)).toBe(ME);
  });
});
