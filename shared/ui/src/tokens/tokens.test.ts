import { describe, expect, it } from 'vitest';
import { contrastRatio } from './contrast';
import { tokens } from './tokens';

describe('Section 6.1 colour tokens', () => {
  it.each([
    ['bg', '#F5F0E6'],
    ['surface', '#FFFDF8'],
    ['sidebar', '#EDE4D3'],
    ['border', '#E2D8C5'],
    ['text', '#2F3B2F'],
    ['textMuted', '#5E6858'],
    ['primary', '#8FC79A'],
    ['primaryStrong', '#3E7A4E'],
    ['primarySoft', '#DCEFD6'],
    ['warning', '#E3B25A'],
    ['danger', '#C97B66'],
  ] as const)('color.%s is %s', (name, value) => {
    expect(tokens.color[name]).toBe(value);
  });

  it.each([
    ['sleep', '#A3A1D9'],
    ['training', '#E8A07E'],
    ['food', '#9CC77A'],
    ['sun', '#EBC06A'],
  ] as const)('color.pillar.%s is %s', (pillar, value) => {
    expect(tokens.color.pillar[pillar]).toBe(value);
  });
});

describe('Section 6.1 size tokens', () => {
  it('spacing scale is 4, 8, 12, 16, 24, 32, 48 px', () => {
    expect(Object.values(tokens.space)).toEqual([4, 8, 12, 16, 24, 32, 48]);
  });

  it('every spacing value is a multiple of 4', () => {
    for (const value of Object.values(tokens.space)) expect(value % 4).toBe(0);
  });

  it('radii are 8, 12, 16 and full', () => {
    expect(tokens.radius).toEqual({ sm: 8, md: 12, lg: 16, full: 9999 });
  });

  it('motion durations are 150 and 250 ms with ease-out', () => {
    expect(tokens.motion).toEqual({ fast: 150, base: 250, easing: 'ease-out' });
  });

  it('focus ring is 2 px primaryStrong with 2 px offset', () => {
    expect(tokens.focus).toEqual({ width: 2, offset: 2, color: tokens.color.primaryStrong });
  });

  it('layout sizes match section 6.1', () => {
    expect(tokens.layout).toEqual({
      sidebarWidth: 240,
      bottomBarHeight: 64,
      contentMaxWidth: 960,
      mobileBreakpoint: 768,
      minTouchTarget: 44,
    });
  });

  it('shadows use the text colour at 6% and 12%', () => {
    expect(tokens.shadow.card).toBe('0 1px 2px rgba(47, 59, 47, 0.06)');
    expect(tokens.shadow.modal).toBe('0 8px 24px rgba(47, 59, 47, 0.12)');
  });
});

describe('Section 6.1 typography tokens', () => {
  it.each([
    ['display', 48, 56, 700],
    ['h1', 24, 32, 600],
    ['h2', 18, 26, 600],
    ['body', 14, 20, 400],
    ['small', 12, 16, 500],
  ] as const)('font.%s is %d/%d px weight %d', (name, size, lineHeight, weight) => {
    expect(tokens.font[name]).toEqual({ size, lineHeight, weight });
  });

  it('uses the bundled Inter font with tabular numbers', () => {
    expect(tokens.font.family).toMatch(/^'Inter Variable'/);
    expect(tokens.font.numericVariant).toBe('tabular-nums');
  });

  it('icons are 20 px with a 1.75 stroke', () => {
    expect(tokens.icon).toEqual({ size: 20, stroke: 1.75 });
  });
});

describe('RNF-10 contrast is at least WCAG AA (4.5:1)', () => {
  const backgrounds = { bg: tokens.color.bg, surface: tokens.color.surface };
  const foregrounds = {
    text: tokens.color.text,
    textMuted: tokens.color.textMuted,
    primaryStrong: tokens.color.primaryStrong,
  };

  for (const [foregroundName, foreground] of Object.entries(foregrounds)) {
    for (const [backgroundName, background] of Object.entries(backgrounds)) {
      it(`${foregroundName} on ${backgroundName}`, () => {
        expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
      });
    }
  }

  it('white text on primaryStrong', () => {
    expect(contrastRatio('#FFFFFF', tokens.color.primaryStrong)).toBeGreaterThanOrEqual(4.5);
  });
});
