import { describe, expect, it } from 'vitest';
import { accentColor, pillarLook } from './pillarLook';

describe('F2-18 pillarLook', () => {
  it.each(['sleep', 'training', 'food', 'sun'])(
    'RF-23 uses the tokens of the "%s" pillar',
    (id) => {
      expect(pillarLook({ color: id, icon: id })).toEqual({ accent: id, icon: id });
    },
  );

  it('RF-23 shows a pillar with no tokens of its own in green with the generic icon', () => {
    expect(pillarLook({ color: 'hydration', icon: 'hydration' })).toEqual({
      accent: 'primary',
      icon: 'pillar',
    });
  });

  it('RF-23 ignores names inherited from Object, such as constructor and toString', () => {
    expect(pillarLook({ color: 'constructor', icon: 'toString' })).toEqual({
      accent: 'primary',
      icon: 'pillar',
    });
  });

  it('turns an accent into its CSS variable', () => {
    expect(accentColor('sun')).toBe('var(--vp-color-pillar-sun)');
    expect(accentColor('primary')).toBe('var(--vp-color-primary)');
  });
});
