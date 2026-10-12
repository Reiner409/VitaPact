import { describe, expect, it } from 'vitest';
import content from '../locales/en/content.json';

const BANNED_WORDS = ['loser', 'lost', 'failed', 'fault', 'blame', 'score', 'points'];
const GENDERED_WORDS = ['he', 'she', 'his', 'her', 'him', 'hers'];

function expectNoBannedOrGenderedWord(text: string) {
  const words = text.toLowerCase().match(/[a-z']+/g) ?? [];
  for (const word of [...BANNED_WORDS, ...GENDERED_WORDS]) expect(words).not.toContain(word);
}

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
        expectNoBannedOrGenderedWord(phrase);
      });
    });
  }
});

// Same ids as VERDICT_BANDS in @vitapact/core/scoring, which looks the texts up by band.
const VERDICT_BANDS = ['pauseWeek', 'lightWeek', 'solidBase', 'onIt', 'greatShape'] as const;

describe('RF-15 verdicts per band (section 9, approved by Rei on 2026-10-12)', () => {
  it('has exactly the five score bands', () => {
    expect(Object.keys(content.verdict).sort()).toEqual([...VERDICT_BANDS].sort());
  });

  for (const band of VERDICT_BANDS) {
    const { title, messages } = content.verdict[band];
    const texts = [title, ...Object.values(messages)];

    describe(band, () => {
      it('has a title and at least 5 messages', () => {
        expect(title).not.toBe('');
        expect(Object.keys(messages).length).toBeGreaterThanOrEqual(5);
      });

      it.each(texts)('uses no banned or gendered word: %s', (text) => {
        expectNoBannedOrGenderedWord(text);
      });

      it.each(texts)('needs no placeholder: %s', (text) => {
        expect(text).not.toMatch(/{{/);
      });
    });
  }
});
