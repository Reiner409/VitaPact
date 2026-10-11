import { describe, expect, it } from 'vitest';
import { createI18n } from './createI18n';

const resources = {
  en: { today: { title: 'Today', greeting: 'Hi {{name}}' } },
  it: { today: { title: 'Oggi' } },
};

describe('RF-22 i18n instance', () => {
  it('translates synchronously in English by default', () => {
    const i18n = createI18n(resources);
    expect(i18n.t('today:title')).toBe('Today');
  });

  it('switches language without code changes', async () => {
    const i18n = createI18n(resources);
    await i18n.changeLanguage('it');
    expect(i18n.t('today:title')).toBe('Oggi');
  });

  it('falls back to English for keys missing in another language', async () => {
    const i18n = createI18n(resources, 'it');
    expect(i18n.t('today:greeting', { name: 'Rei' })).toBe('Hi Rei');
  });

  it('does not HTML-escape values (React already escapes text)', () => {
    const i18n = createI18n(resources);
    expect(i18n.t('today:greeting', { name: '<b>' })).toBe('Hi <b>');
  });
});
