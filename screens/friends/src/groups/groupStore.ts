import type { GroupDetails } from '@vitapact/core/groups';
import {
  listFriends,
  listGroups,
  saveGroup,
  type Friend,
  type Group,
  type VitaPactDatabase,
} from '@vitapact/core/storage';

export interface FriendsData {
  groups: Group[];
  friends: Friend[];
}

export interface NewGroup extends GroupDetails {
  memberIds: readonly string[];
}

const byCreation = (a: Group, b: Group) => a.createdAt.localeCompare(b.createdAt);
const byNickname = (a: Friend, b: Friend) =>
  a.nickname.localeCompare(b.nickname) || a.userId.localeCompare(b.userId);

/** Groups oldest first, so the default selection stays the same; friends by nickname, then
 * by user id so two friends with the same nickname keep a stable order. */
export async function loadFriendsData(db: VitaPactDatabase): Promise<FriendsData> {
  const [groups, friends] = await Promise.all([listGroups(db), listFriends(db)]);
  return { groups: groups.sort(byCreation), friends: friends.sort(byNickname) };
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
