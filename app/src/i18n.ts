import { createI18n, resourcesFromModules } from '@vitapact/i18n';

const translationFiles = import.meta.glob(
  ['../locales/*/*.json', '../../screens/*/locales/*/*.json', '../../shared/*/locales/*/*.json'],
  { eager: true, import: 'default' },
);

export const resources = resourcesFromModules(translationFiles);
export const i18n = createI18n(resources);
