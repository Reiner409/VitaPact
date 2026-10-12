/** RF-25, G9.7: measured in code points, so an emoji counts once. */
export const GROUP_NAME_MAX_LENGTH = 40;
export const GROUP_STAKE_MAX_LENGTH = 80;

export interface GroupDetails {
  readonly name: string;
  readonly stake: string;
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

export function checkGroupDetails(input: GroupDetails): GroupDetailsResult {
  const details = { name: input.name.trim(), stake: input.stake.trim() };
  const errors = [
    textError(details.name, GROUP_NAME_MAX_LENGTH, ['nameMissing', 'nameTooLong']),
    textError(details.stake, GROUP_STAKE_MAX_LENGTH, ['stakeMissing', 'stakeTooLong']),
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
