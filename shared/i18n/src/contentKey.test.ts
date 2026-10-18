import { describe, expect, it } from 'vitest';
import content from '../locales/en/content.json';
import { contentKey, STAKE_COUNT, WEEKEND_PHRASE_COUNTS, type VerdictBandId } from './contentKey';

const BANDS: VerdictBandId[] = ['pauseWeek', 'lightWeek', 'solidBase', 'onIt', 'greatShape'];

const lookup = (key: string) =>
  key
    .replace(/^content:/, '')
    .split('.')
    .reduce<unknown>((node, part) => (node as Record<string, unknown>)[part], content);

describe('F3-WK-02 RF-15 verdict title keys', () => {
  it.each(BANDS)('finds the English title of %s', (band) => {
    expect(typeof lookup(contentKey.verdictTitle(band))).toBe('string');
  });
});

describe('F2-14 RF-26 weekend phrase keys', () => {
  it('finds every friends phrase and every payer phrase by index', () => {
    for (let index = 0; index < WEEKEND_PHRASE_COUNTS.friends; index += 1) {
      expect(typeof lookup(contentKey.weekendFriends(index))).toBe('string');
    }
    for (let index = 0; index < WEEKEND_PHRASE_COUNTS.payer; index += 1) {
      expect(typeof lookup(contentKey.weekendPayer(index))).toBe('string');
    }
  });

  it('numbers the phrases from 01 with no gap', () => {
    expect(WEEKEND_PHRASE_COUNTS).toEqual({
      friends: Object.keys(content.weekend.friends).length,
      payer: Object.keys(content.weekend.payer).length,
    });
    expect(lookup(contentKey.weekendFriends(WEEKEND_PHRASE_COUNTS.friends))).toBeUndefined();
  });
});

describe('F3-FR-10 RF-25 rotating stake keys', () => {
  it('finds every stake by index, numbered from 01 with no gap', () => {
    expect(STAKE_COUNT).toBeGreaterThan(1);
    for (let index = 0; index < STAKE_COUNT; index += 1) {
      expect(typeof lookup(contentKey.stake(index))).toBe('string');
    }
    expect(lookup(contentKey.stake(STAKE_COUNT))).toBeUndefined();
  });
});
