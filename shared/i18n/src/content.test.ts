import { describe, expect, it } from 'vitest';
import content from '../locales/en/content.json';

const BANNED_WORDS = ['loser', 'lost', 'failed', 'fault', 'blame', 'score', 'points'];
const GENDERED_WORDS = ['he', 'she', 'his', 'her', 'him', 'hers'];

const groups = {
  friends: { phrases: Object.values(content.weekend.friends), minimum: 12 },
  payer: { phrases: Object.values(content.weekend.payer), minimum: 6 },
};

describe('RF-26 weekend phrases (section 9.1, approved by Rei on 2026-10-11)', () => {
  for (const [group, { phrases, minimum }] of Object.entries(groups)) {
    describe(group, () => {
      it(`has at least ${minimum} phrases`, () => {
        expect(phrases.length).toBeGreaterThanOrEqual(minimum);
      });

      it.each(phrases)('contains {{name}} and {{stake}}: %s', (phrase) => {
        expect(phrase).toContain('{{name}}');
        expect(phrase).toContain('{{stake}}');
      });

      it.each(phrases)('RF-15 uses no banned or gendered word: %s', (phrase) => {
        const words = phrase.toLowerCase().match(/[a-z']+/g) ?? [];
        for (const word of [...BANNED_WORDS, ...GENDERED_WORDS]) expect(words).not.toContain(word);
      });
    });
  }
});
