import i18next, { type i18n as I18n } from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { Resources } from './resources';

export const DEFAULT_LANGUAGE = 'en';

export function createI18n(resources: Resources, language = DEFAULT_LANGUAGE): I18n {
  const instance = i18next.createInstance();
  void instance.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: DEFAULT_LANGUAGE,
    initAsync: false,
    interpolation: { escapeValue: false },
    returnNull: false,
  });
  return instance;
}

export type { I18n };
