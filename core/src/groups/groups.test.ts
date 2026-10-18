import { describe, expect, it } from 'vitest';
import {
  GROUP_NAME_MAX_LENGTH,
  GROUP_STAKE_MAX_LENGTH,
  checkGroupDetails,
  groupsOfMember,
  withMember,
  withoutMember,
} from './index';

const office = { id: 'office', memberIds: ['ana'] };
const fiveASide = { id: 'five-a-side', memberIds: ['ana', 'bo'] };

describe('RF-25 group name and stake', () => {
  it('accepts a name and a stake, trimmed', () => {
    expect(checkGroupDetails({ name: '  Office ', stake: ' buys the pizza ' })).toEqual({
      ok: true,
      details: { name: 'Office', stake: 'buys the pizza', stakeRotates: false },
    });
  });

  it('asks for both a name and a stake', () => {
    expect(checkGroupDetails({ name: ' ', stake: '' })).toEqual({
      ok: false,
      errors: ['nameMissing', 'stakeMissing'],
    });
  });

  it('counts emoji once against the length limits', () => {
    const name = '🍕'.repeat(GROUP_NAME_MAX_LENGTH);
    const stake = '🍺'.repeat(GROUP_STAKE_MAX_LENGTH);
    expect(checkGroupDetails({ name, stake }).ok).toBe(true);
    expect(checkGroupDetails({ name: `${name}🍕`, stake: `${stake}🍺` })).toEqual({
      ok: false,
      errors: ['nameTooLong', 'stakeTooLong'],
    });
  });
});

describe('F3-FR-10 RF-25 a stake that rotates every week', () => {
  it('needs no stake text and drops what was typed before switching', () => {
    expect(checkGroupDetails({ name: 'Office', stake: ' the beer ', stakeRotates: true })).toEqual({
      ok: true,
      details: { name: 'Office', stake: '', stakeRotates: true },
    });
  });

  it('still asks for the name', () => {
    expect(checkGroupDetails({ name: '', stake: '', stakeRotates: true })).toEqual({
      ok: false,
      errors: ['nameMissing'],
    });
  });
});

describe('RF-25 group members', () => {
  it('adds a friend once, however often it is asked', () => {
    expect(withMember(withMember(office, 'bo'), 'bo').memberIds).toEqual(['ana', 'bo']);
  });

  it('removes a friend and keeps the rest of the group', () => {
    expect(withoutMember(fiveASide, 'ana')).toEqual({ id: 'five-a-side', memberIds: ['bo'] });
  });

  it('lets a friend be in more than one group', () => {
    expect(groupsOfMember([office, fiveASide], 'ana').map((group) => group.id)).toEqual([
      'office',
      'five-a-side',
    ]);
    expect(groupsOfMember([office, fiveASide], 'bo').map((group) => group.id)).toEqual([
      'five-a-side',
    ]);
  });
});
