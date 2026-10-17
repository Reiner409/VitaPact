import {
  deleteGroup,
  listFriends,
  listGroups,
  saveGroup,
  type Friend,
  type Group,
  type VitaPactDatabase,
} from '@vitapact/core/storage';
import type { GroupDraft } from '@vitapact/ui';
import { useEffect, useState } from 'react';

/** Which dialog is open: a new group, a group being edited, or a group about to be deleted. */
export type GroupAction =
  { kind: 'create' } | { kind: 'edit'; group: Group } | { kind: 'delete'; group: Group };

const byCreation = (a: Group, b: Group) => a.createdAt.localeCompare(b.createdAt);

interface GroupsData {
  groups: Group[];
  friends: Friend[];
}

async function loadGroups(db: VitaPactDatabase): Promise<GroupsData> {
  const [groups, friends] = await Promise.all([listGroups(db), listFriends(db)]);
  return { groups: groups.sort(byCreation), friends };
}

/** RF-25: the groups and the friends who can join them, with create, edit and delete. */
export function useGroups(db: VitaPactDatabase, now: () => Date) {
  const [data, setData] = useState<GroupsData>({ groups: [], friends: [] });
  const [action, setAction] = useState<GroupAction>();
  const reload = async () => setData(await loadGroups(db));

  useEffect(() => {
    let current = true;
    void loadGroups(db).then((loaded) => current && setData(loaded));
    return () => {
      current = false;
    };
  }, [db]);

  async function save(draft: GroupDraft) {
    const base =
      action?.kind === 'edit'
        ? action.group
        : { id: crypto.randomUUID(), createdAt: now().toISOString() };
    await saveGroup(db, { ...base, ...draft, memberIds: [...draft.memberIds] });
    await reload();
  }

  async function remove(group: Group) {
    await deleteGroup(db, group.id);
    setAction(undefined);
    await reload();
  }

  return { ...data, action, setAction, save, remove };
}
