import type { VitaPactDatabase } from './database';
import type { Friend, FriendReport, IsoWeek } from './records';

export async function saveFriend(db: VitaPactDatabase, friend: Friend): Promise<void> {
  await db.friends.put(friend);
}

export const getFriend = (db: VitaPactDatabase, userId: string): Promise<Friend | undefined> =>
  db.friends.get(userId);

export const listFriends = (db: VitaPactDatabase): Promise<Friend[]> => db.friends.toArray();

/**
 * Stores a report together with its author's updated record, both or neither. A report for a
 * week already imported from the same friend replaces the previous one.
 */
export async function saveFriendReport(
  db: VitaPactDatabase,
  friend: Friend,
  report: FriendReport,
): Promise<void> {
  await db.transaction('rw', db.friends, db.friendReports, async () => {
    await db.friends.put(friend);
    await db.friendReports.put(report);
  });
}

export const getFriendReport = (
  db: VitaPactDatabase,
  userId: string,
  week: IsoWeek,
): Promise<FriendReport | undefined> => db.friendReports.get([userId, week]);

export const listFriendReportsOfWeek = (
  db: VitaPactDatabase,
  week: IsoWeek,
): Promise<FriendReport[]> => db.friendReports.where('week').equals(week).toArray();

/** One friend's reports, oldest week first. */
export const listFriendReportsOf = (
  db: VitaPactDatabase,
  userId: string,
): Promise<FriendReport[]> => db.friendReports.where('userId').equals(userId).sortBy('week');
