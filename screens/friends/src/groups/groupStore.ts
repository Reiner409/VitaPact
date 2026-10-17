import type { CalendarDate, IsoWeek } from '@vitapact/core/calendar';
import type { GroupDetails, RankedReport } from '@vitapact/core/groups';
import {
  listFriendReports,
  listFriends,
  listGroups,
  saveGroup,
  type Friend,
  type Group,
  type Profile,
  type VitaPactDatabase,
} from '@vitapact/core/storage';
import { loadOwnReports, rankingWeekOf } from '../ranking/ownReports';

export interface FriendsData {
  groups: Group[];
  friends: Friend[];
  /** Friends' reports and your own weeks, for the rankings to pick from. */
  reports: RankedReport[];
  ownUserId: string;
  ownNickname: string;
  rankingWeek: IsoWeek;
}

export interface NewGroup extends GroupDetails {
  memberIds: readonly string[];
}

const byCreation = (a: Group, b: Group) => a.createdAt.localeCompare(b.createdAt);
const byNickname = (a: Friend, b: Friend) =>
  a.nickname.localeCompare(b.nickname) || a.userId.localeCompare(b.userId);

/** Groups oldest first, so the default selection stays the same; friends by nickname, then
 * by user id so two friends with the same nickname keep a stable order. */
export async function loadFriendsData(
  db: VitaPactDatabase,
  profile: Profile | undefined,
  today: CalendarDate,
): Promise<FriendsData> {
  const rankingWeek = rankingWeekOf(today);
  const [groups, friends, friendReports, ownReports] = await Promise.all([
    listGroups(db),
    listFriends(db),
    listFriendReports(db),
    profile ? loadOwnReports(db, profile, rankingWeek) : [],
  ]);
  return {
    groups: groups.sort(byCreation),
    friends: friends.sort(byNickname),
    reports: [...friendReports.map(({ summary }) => summary), ...ownReports],
    ownUserId: profile?.userId ?? '',
    ownNickname: profile?.nickname ?? '',
    rankingWeek,
  };
}

export async function createGroup(
  db: VitaPactDatabase,
  { name, stake, memberIds }: NewGroup,
  createdAt: Date,
): Promise<Group> {
  const group: Group = {
    id: crypto.randomUUID(),
    name,
    stake,
    memberIds: [...memberIds],
    createdAt: createdAt.toISOString(),
  };
  await saveGroup(db, group);
  return group;
}
