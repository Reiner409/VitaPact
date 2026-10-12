import { NICKNAME_MAX_LENGTH } from '@vitapact/core/report';
import { describe, expect, it } from 'vitest';
import { nicknameLength, nicknameProblem } from './nickname';

describe('RF-01 nickname rule of the welcome', () => {
  it('refuses an empty nickname', () => {
    expect(nicknameProblem('')).toBe('empty');
  });

  it('refuses a nickname made only of spaces', () => {
    expect(nicknameProblem('   \t ')).toBe('empty');
  });

  it('accepts exactly the report limit and refuses one more character', () => {
    expect(nicknameProblem('x'.repeat(NICKNAME_MAX_LENGTH))).toBeUndefined();
    expect(nicknameProblem('x'.repeat(NICKNAME_MAX_LENGTH + 1))).toBe('tooLong');
  });

  it('counts accented letters and emoji as one character each', () => {
    const nickname = `Élodie 🌞${'é'.repeat(NICKNAME_MAX_LENGTH - 8)}`;
    expect(nicknameLength(nickname)).toBe(NICKNAME_MAX_LENGTH);
    expect(nicknameProblem(nickname)).toBeUndefined();
  });

  it('ignores the spaces around the nickname when counting', () => {
    expect(nicknameProblem(`  ${'x'.repeat(NICKNAME_MAX_LENGTH)}  `)).toBeUndefined();
  });

  it('refuses control characters the report reader would refuse', () => {
    expect(nicknameProblem('Rei\u0007')).toBe('unprintable');
  });
});
