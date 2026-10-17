import type { MonthlyRankingRow, RankingRow } from '@vitapact/core/groups';
import { verdictBand } from '@vitapact/core/scoring';
import { contentKey, type useTranslation } from '@vitapact/i18n';
import type { RankingListRow } from '@vitapact/ui';

type Translate = ReturnType<typeof useTranslation>['t'];

/** The nickname of every member, You included; a waiting row carries only the user id. */
export type NicknameOf = (userId: string) => string;

/** Opens a friend's history (RF-13); your own row opens nothing. */
export type OnSelectFriend = (userId: string) => void;

/** Makes every friend's row a button that opens their history. */
export const selectable = (rows: RankingListRow[], onSelect: OnSelectFriend): RankingListRow[] =>
  rows.map((row) => (row.you ? row : { ...row, onSelect: () => onSelect(row.id) }));

function weightChange(t: Translate, delta: number | undefined): string[] {
  if (delta === undefined) return [];
  const change = delta > 0 ? `+${delta}` : String(delta);
  return [t('friends:ranking.weightChange', { change })];
}

const waitingRow = (t: Translate, nicknameOf: NicknameOf, userId: string, isYou: boolean) => ({
  id: userId,
  position: null,
  name: nicknameOf(userId),
  you: isYou,
  waiting: t('friends:ranking.waiting'),
});

/** RF-13, RF-14, RF-15, RF-27: what each row of the weekly ranking says. */
export function weeklyRows(
  t: Translate,
  rows: readonly RankingRow[],
  nicknameOf: NicknameOf,
): RankingListRow[] {
  return rows.map((row) => {
    if (row.kind === 'waiting') return waitingRow(t, nicknameOf, row.userId, row.isYou);
    return {
      id: row.userId,
      position: row.position,
      name: row.nickname,
      you: row.isYou,
      value: String(row.score),
      details: [
        t(contentKey.verdictTitle(verdictBand(row.score))),
        ...weightChange(t, row.weightDelta),
      ],
      ...(row.comebackGain !== undefined && {
        comeback: t('friends:ranking.comeback', { points: row.comebackGain }),
      }),
    };
  });
}

/** RF-26: the month's ranking, by the average of the weekly scores. */
export function monthlyRows(
  t: Translate,
  rows: readonly MonthlyRankingRow[],
  nicknameOf: NicknameOf,
): RankingListRow[] {
  return rows.map((row) => {
    if (row.kind === 'waiting') return waitingRow(t, nicknameOf, row.userId, row.isYou);
    return {
      id: row.userId,
      position: row.position,
      name: row.nickname,
      you: row.isYou,
      value: t('friends:ranking.average', { average: row.average }),
      details: [t('friends:ranking.weeks', { count: row.weeks })],
    };
  });
}
