import { describe, expect, it } from 'vitest';
import { contrastRatio } from './contrast';

describe('contrastRatio', () => {
  it('is 21 for black on white', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
  });

  it('is 1 for identical colours', () => {
    expect(contrastRatio('#8FC79A', '#8FC79A')).toBe(1);
  });

  it('does not depend on argument order', () => {
    expect(contrastRatio('#2F3B2F', '#F5F0E6')).toBe(contrastRatio('#F5F0E6', '#2F3B2F'));
  });

  it('rejects colours that are not #RRGGBB', () => {
    expect(() => contrastRatio('red', '#FFFFFF')).toThrow();
  });
});
