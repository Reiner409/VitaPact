import { pillarRegistry } from '@vitapact/core/pillars';
import { createI18n } from '@vitapact/i18n';
import { describe, expect, it } from 'vitest';
import pillars from '@vitapact/i18n/locales/en/pillars.json';
import { answerLines } from './dayText';

const i18n = createI18n({ en: { pillars } });
const t = i18n.getFixedT('en', 'week');

describe('F3-WK-04 the answers of a day', () => {
  it('RF-04 writes each answer with the texts of the Today screen', () => {
    const training = pillarRegistry.list().find(({ id }) => id === 'training');
    if (!training) throw new Error('No training pillar');
    expect(answerLines(t, training, { trained: true, type: 'gym', minutes: 45 })).toEqual([
      { label: 'Trained today?', answer: 'Yes' },
      { label: 'Workout', answer: 'Gym' },
      { label: 'Duration', answer: '45 min' },
    ]);
  });

  it('finds a text for every answer of every pillar', () => {
    const sample = { hours: 7.5, quality: 3, trained: false, rating: 2, minutes: 10 };
    for (const pillar of pillarRegistry.list()) {
      const values = Object.fromEntries(
        pillar.fields.map(({ key }) => [key, sample[key as keyof typeof sample] ?? 'gym']),
      );
      for (const { label, answer } of answerLines(t, pillar, values)) {
        expect(label).not.toContain('pillars');
        expect(answer).not.toContain('pillars');
      }
    }
  });
});
