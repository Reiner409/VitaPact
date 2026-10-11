import type { VitaPactDatabase } from './database';
import type { Group } from './records';

export async function saveGroup(db: VitaPactDatabase, group: Group): Promise<void> {
  await db.groups.put(group);
}

export const getGroup = (db: VitaPactDatabase, id: string): Promise<Group | undefined> =>
  db.groups.get(id);

export const listGroups = (db: VitaPactDatabase): Promise<Group[]> => db.groups.toArray();

export async function deleteGroup(db: VitaPactDatabase, id: string): Promise<void> {
  await db.groups.delete(id);
}
