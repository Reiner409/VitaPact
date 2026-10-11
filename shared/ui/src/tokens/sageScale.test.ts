import { describe, expect, it } from 'vitest';
import { buildSageScale } from './sageScale';
import { tokens } from './tokens';

describe('Mantine "sage" scale (section 6.1)', () => {
  const scale = buildSageScale(tokens.color);

  it('has 10 shades', () => {
    expect(scale).toHaveLength(10);
  });

  it('places the three palette greens at shades 1, 4 and 7', () => {
    expect(scale[1]).toBe(tokens.color.primarySoft);
    expect(scale[4]).toBe(tokens.color.primary);
    expect(scale[7]).toBe(tokens.color.primaryStrong);
  });

  it('goes from light to dark', () => {
    const brightness = scale.map(
      (hex) => parseInt(hex.slice(1, 3), 16) + parseInt(hex.slice(3, 5), 16),
    );
    const sorted = [...brightness].sort((a, b) => b - a);
    expect(brightness).toEqual(sorted);
  });

  it('only contains #RRGGBB colours', () => {
    for (const shade of scale) expect(shade).toMatch(/^#[0-9A-F]{6}$/);
  });
});
