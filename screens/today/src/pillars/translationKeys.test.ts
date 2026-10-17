import { pillarRegistry } from '@vitapact/core/pillars';
import { hydrationPillar } from '@vitapact/core/pillars/testing';
import { describe, expect, it } from 'vitest';
import pillars from '@vitapact/i18n/locales/en/pillars.json';
import { translationKeysOf } from './translationKeys';

const hasText = (tree: unknown, key: string): boolean => {
  const leaf = key
    .split('.')
    .reduce<unknown>(
      (node, part) =>
        typeof node === 'object' && node !== null && Object.hasOwn(node, part)
          ? (node as Record<string, unknown>)[part]
          : undefined,
      tree,
    );
  return typeof leaf === 'string';
};

describe('G5.3 translations of the pillar cards', () => {
  it('RF-23 has an English text for every key the pillars of the registry ask for', () => {
    const missing = translationKeysOf(pillarRegistry.list()).filter(
      (key) => !hasText(pillars, key.replace(/^pillars:/, '')),
    );
    expect(missing).toEqual([]);
  });

  it('RF-23 lists the keys a new pillar would need, so adding one is only translations', () => {
    expect(translationKeysOf([hydrationPillar])).toContain('pillars:hydration.name');
  });
});
