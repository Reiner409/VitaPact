import { describe, expect, it } from 'vitest';
import { resourcesFromModules } from './resources';

describe('RF-22 translation resources are discovered from files', () => {
  it('maps locales/<lang>/<namespace>.json to resources[lang][namespace]', () => {
    const resources = resourcesFromModules({
      '../../screens/today/locales/en/today.json': { title: 'Today' },
      '../locales/en/app.json': { name: 'VitaPact' },
    });
    expect(resources).toEqual({ en: { today: { title: 'Today' }, app: { name: 'VitaPact' } } });
  });

  it('adding a language is only a new file', () => {
    const resources = resourcesFromModules({
      '/screens/today/locales/en/today.json': { title: 'Today' },
      '/screens/today/locales/it/today.json': { title: 'Oggi' },
    });
    expect(resources.it?.today).toEqual({ title: 'Oggi' });
  });

  it('rejects two files that declare the same language and namespace', () => {
    expect(() =>
      resourcesFromModules({
        '/screens/today/locales/en/today.json': {},
        '/screens/week/locales/en/today.json': {},
      }),
    ).toThrow(/today/);
  });

  it('rejects paths that do not follow locales/<lang>/<namespace>.json', () => {
    expect(() => resourcesFromModules({ '/screens/today/en.json': {} })).toThrow(/locales/);
  });
});
