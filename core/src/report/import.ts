import type { IsoWeek } from '../calendar';
import { readReport, type ReportReadError } from './report';
import type { ReportSummary } from './summary';

/** A friend as this device first met them: the key their first report carried (section 10.1). */
export interface KnownFriend {
  readonly userId: string;
  readonly publicKey: string;
}

/** How the import looks up what is already saved; storage passes in its own implementation. */
export interface FriendDirectory {
  findFriend(userId: string): Promise<KnownFriend | undefined>;
  hasReport(userId: string, week: IsoWeek): Promise<boolean>;
}

export interface ImportContext {
  readonly ownUserId: string;
  readonly friends: FriendDirectory;
}

export type ImportRejection = ReportReadError | 'ownReport' | 'keyChanged';

/** What the screen shows before the user confirms; nothing is saved here. */
export type ImportOutcome =
  | { kind: 'newFriend' | 'update' | 'replaceWeek'; summary: ReportSummary }
  | { kind: 'rejected'; reason: ImportRejection };

async function acceptedKind(
  summary: ReportSummary,
  friends: FriendDirectory,
): Promise<ImportOutcome> {
  const friend = await friends.findFriend(summary.uid);
  if (!friend) return { kind: 'newFriend', summary };
  if (friend.publicKey !== summary.pub) return { kind: 'rejected', reason: 'keyChanged' };
  const replaces = await friends.hasReport(summary.uid, summary.week);
  return { kind: replaces ? 'replaceWeek' : 'update', summary };
}

/**
 * RF-12, RF-28: the first report from a UUID registers its key, later ones must carry the same
 * key, and your own report never comes back as a friend's.
 */
export async function importFriendReport(
  content: Uint8Array,
  { ownUserId, friends }: ImportContext,
): Promise<ImportOutcome> {
  const read = await readReport(content);
  if (!read.ok) return { kind: 'rejected', reason: read.error };
  if (read.summary.uid === ownUserId) return { kind: 'rejected', reason: 'ownReport' };
  return acceptedKind(read.summary, friends);
}
