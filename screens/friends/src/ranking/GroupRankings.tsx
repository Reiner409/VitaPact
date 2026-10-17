import { monthlyRanking, weeklyRanking } from '@vitapact/core/groups';
import { monthOfWeek, sundayOf } from '@vitapact/core/calendar';
import type { Group } from '@vitapact/core/storage';
import { useTranslation } from '@vitapact/i18n';
import { RankingList, Stack } from '@vitapact/ui';
import type { FriendsData } from '../groups/groupStore';
import { monthlyRows, weeklyRows } from './rankingRows';

export interface GroupRankingsProps {
  data: FriendsData;
  group: Group;
}

const weekNumberOf = (week: string) => Number(week.slice(week.indexOf('W') + 1));

function monthName(week: string, language: string): string {
  const sunday = new Date(`${sundayOf(week)}T00:00:00Z`);
  return new Intl.DateTimeFormat(language, { month: 'long', timeZone: 'UTC' }).format(sunday);
}

/** Section 5.4: the week's ranking, then the month's; You always have a row. */
export function GroupRankings({ data, group }: GroupRankingsProps) {
  const { t, i18n } = useTranslation('friends');
  const input = { memberIds: group.memberIds, ownUserId: data.ownUserId, reports: data.reports };
  const nicknames = new Map(data.friends.map(({ userId, nickname }) => [userId, nickname]));
  const nicknameOf = (userId: string) =>
    userId === data.ownUserId ? data.ownNickname : (nicknames.get(userId) ?? '');
  const week = data.rankingWeek;
  return (
    <Stack>
      <RankingList
        label={t('ranking.weekly', { week: weekNumberOf(week) })}
        youLabel={t('ranking.you')}
        rows={weeklyRows(t, weeklyRanking(input, week), nicknameOf)}
      />
      <RankingList
        label={t('ranking.monthly', { month: monthName(week, i18n.language) })}
        youLabel={t('ranking.you')}
        rows={monthlyRows(t, monthlyRanking(input, monthOfWeek(week)), nicknameOf)}
      />
    </Stack>
  );
}
