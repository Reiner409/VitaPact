import { describe, expect, it } from 'vitest';
import content from '../locales/en/content.json';
import { contentKey, type VerdictBandId } from './contentKey';

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
