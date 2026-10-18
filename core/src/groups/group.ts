/** RF-25, G9.7: measured in code points, so an emoji counts once. */
export const GROUP_NAME_MAX_LENGTH = 40;
export const GROUP_STAKE_MAX_LENGTH = 80;

export interface GroupDetails {
  readonly name: string;
  /** Empty when the stake rotates. */
  readonly stake: string;
  /** RF-25: the app picks a new stake from a fixed list every week (`weeklyStakeIndex`). */
  readonly stakeRotates?: boolean;
}

export type GroupDetailsError = 'nameMissing' | 'nameTooLong' | 'stakeMissing' | 'stakeTooLong';

export type GroupDetailsResult =
  { ok: true; details: GroupDetails } | { ok: false; errors: GroupDetailsError[] };

/** The part of a group the membership rules need; storage keeps the rest. */
export interface GroupMembership {
  readonly memberIds: readonly string[];
}

function textError(
  text: string,
  maxLength: number,
  [missing, tooLong]: readonly [GroupDetailsError, GroupDetailsError],
): GroupDetailsError | undefined {
  if (text.length === 0) return missing;
  return [...text].length > maxLength ? tooLong : undefined;
}

/** A rotating stake needs no text of its own, so whatever was typed before switching is dropped. */
export function checkGroupDetails(input: GroupDetails): GroupDetailsResult {
  const stakeRotates = input.stakeRotates === true;
  const details = {
    name: input.name.trim(),
    stake: stakeRotates ? '' : input.stake.trim(),
    stakeRotates,
  };
  const errors = [
    textError(details.name, GROUP_NAME_MAX_LENGTH, ['nameMissing', 'nameTooLong']),
    stakeRotates
      ? undefined
      : textError(details.stake, GROUP_STAKE_MAX_LENGTH, ['stakeMissing', 'stakeTooLong']),
  ].filter((error) => error !== undefined);
  return errors.length === 0 ? { ok: true, details } : { ok: false, errors };
}

export function withMember<T extends GroupMembership>(group: T, userId: string): T {
  if (group.memberIds.includes(userId)) return group;
  return { ...group, memberIds: [...group.memberIds, userId] };
}

export function withoutMember<T extends GroupMembership>(group: T, userId: string): T {
  return { ...group, memberIds: group.memberIds.filter((memberId) => memberId !== userId) };
}

/** RF-25: a friend can be in several groups on the same device. */
export function groupsOfMember<T extends GroupMembership>(
  groups: readonly T[],
  userId: string,
): T[] {
  return groups.filter((group) => group.memberIds.includes(userId));
}
