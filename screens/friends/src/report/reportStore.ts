import { withMember } from '@vitapact/core/groups';
import { importFriendReport, type ImportOutcome, type ReportSummary } from '@vitapact/core/report';
import {
  getFriend,
  getFriendReport,
  listGroups,
  saveFriendReport,
  saveGroup,
  type VitaPactDatabase,
} from '@vitapact/core/storage';

/** RF-12, RF-28: checks the report against what this device already knows; saves nothing. */
export function checkReport(
  db: VitaPactDatabase,
  ownUserId: string,
  content: Uint8Array,
): Promise<ImportOutcome> {
  return importFriendReport(content, {
    ownUserId,
    friends: {
      findFriend: (userId) => getFriend(db, userId),
      hasReport: async (userId, week) => (await getFriendReport(db, userId, week)) !== undefined,
    },
  });
}

/**
 * Saves the friend and their report together and, for a new friend, adds them to the groups
 * the user picked (RF-25). A later report updates the nickname the friend now uses.
 */
export async function saveReport(
  db: VitaPactDatabase,
  summary: ReportSummary,
  groupIds: readonly string[],
  now: Date,
): Promise<void> {
  const importedAt = now.toISOString();
  const known = await getFriend(db, summary.uid);
  const friend = {
    userId: summary.uid,
    nickname: summary.nick,
    publicKey: summary.pub,
    firstSeenAt: known?.firstSeenAt ?? importedAt,
    lastReportAt: importedAt,
  };
  const report = { userId: summary.uid, week: summary.week, summary, importedAt };
  // One transaction, so a failure leaves neither the report nor the memberships behind.
  await db.transaction('rw', db.friends, db.friendReports, db.groups, async () => {
    await saveFriendReport(db, friend, report);
    const groups = await listGroups(db);
    const chosen = groups.filter(({ id }) => groupIds.includes(id));
    await Promise.all(chosen.map((group) => saveGroup(db, withMember(group, summary.uid))));
  });
}
