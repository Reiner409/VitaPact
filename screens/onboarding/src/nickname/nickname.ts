import { NICKNAME_MAX_LENGTH } from '@vitapact/core/report';

export type NicknameProblem = 'empty' | 'tooLong' | 'unprintable';

/**
 * The rule checks the trimmed nickname, which is the one the welcome hands on and saves, so it is
 * the same rule the report reader applies to `nick` and every saved nickname fits a report (F2-10).
 */
const UNPRINTABLE = /[\p{Cc}\p{Cs}]/u;

/** Counts what the user sees as characters: an emoji is one, not two UTF-16 units. */
export const nicknameLength = (nickname: string): number => [...nickname.trim()].length;

export function nicknameProblem(nickname: string): NicknameProblem | undefined {
  if (nickname.trim() === '') return 'empty';
  if (nicknameLength(nickname) > NICKNAME_MAX_LENGTH) return 'tooLong';
  if (UNPRINTABLE.test(nickname)) return 'unprintable';
  return undefined;
}
