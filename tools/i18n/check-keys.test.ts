import { describe, expect, it } from 'vitest';
import { checkTranslationKeys } from './check-keys';

describe('RNF-12 RF-22 every translation key used in the code exists in English', () => {
  it('finds no missing key in the repository', () => {
    expect(checkTranslationKeys()).toEqual([]);
  });
});
