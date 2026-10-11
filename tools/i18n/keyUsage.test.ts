import { describe, expect, it } from 'vitest';
import { extractKeyUsages, findMissingKeys } from './keyUsage';

describe('RNF-12 translation key scanner', () => {
  it('reads keys from t() calls using the namespace of useTranslation', () => {
    const source = `const { t } = useTranslation('today');\nreturn <h1>{t('title')}</h1>;`;
    expect(extractKeyUsages(source, 'a.tsx')).toEqual([
      { namespace: 'today', key: 'title', file: 'a.tsx' },
    ]);
  });

  it('accepts an explicit namespace prefix', () => {
    const source = `t("app:nav.today")`;
    expect(extractKeyUsages(source, 'a.tsx')).toEqual([
      { namespace: 'app', key: 'nav.today', file: 'a.tsx' },
    ]);
  });

  it('reports keys whose namespace cannot be known', () => {
    expect(extractKeyUsages(`t('title')`, 'a.tsx')).toEqual([
      { namespace: undefined, key: 'title', file: 'a.tsx' },
    ]);
  });

  it('ignores calls that are not t()', () => {
    expect(extractKeyUsages(`format('x'); it('works')`, 'a.tsx')).toEqual([]);
  });

  it('finds keys missing from the English resources, including nested ones', () => {
    const resources = { today: { title: 'Today', card: { sleep: 'Sleep' } } };
    const usages = [
      { namespace: 'today', key: 'title', file: 'a.tsx' },
      { namespace: 'today', key: 'card.sleep', file: 'a.tsx' },
      { namespace: 'today', key: 'card.sun', file: 'a.tsx' },
      { namespace: 'week', key: 'title', file: 'b.tsx' },
      { namespace: undefined, key: 'title', file: 'c.tsx' },
    ];
    expect(
      findMissingKeys(usages, resources).map((usage) => `${usage.namespace}:${usage.key}`),
    ).toEqual(['today:card.sun', 'week:title', 'undefined:title']);
  });
});
