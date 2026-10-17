import { describe, expect, it } from 'vitest';
import { buildCssVariables, buildGlobalCss } from './cssVariables';
import { tokens } from './tokens';

describe('CSS variables generated from tokens', () => {
  const variables = buildCssVariables(tokens);

  it('exposes every colour, including pillars', () => {
    expect(variables['--vp-color-bg']).toBe('#F5F0E6');
    expect(variables['--vp-color-primary-strong']).toBe('#3E7A4E');
    expect(variables['--vp-color-pillar-sleep']).toBe('#A3A1D9');
    expect(variables['--vp-color-pillar-sun']).toBe('#EBC06A');
  });

  it('adds px units to sizes', () => {
    expect(variables['--vp-space-4']).toBe('16px');
    expect(variables['--vp-radius-md']).toBe('12px');
    expect(variables['--vp-layout-sidebar-width']).toBe('240px');
    expect(variables['--vp-layout-min-touch-target']).toBe('44px');
  });

  it('adds ms units to motion durations', () => {
    expect(variables['--vp-motion-fast']).toBe('150ms');
    expect(variables['--vp-motion-base']).toBe('250ms');
    expect(variables['--vp-motion-easing']).toBe('ease-out');
  });

  it('has one variable per colour token', () => {
    const colourVariables = Object.keys(variables).filter((name) => name.startsWith('--vp-color-'));
    expect(colourVariables).toHaveLength(15);
  });
});

describe('Reduced motion', () => {
  const css = buildGlobalCss(tokens);

  it('zeroes motion tokens when Windows asks to reduce motion', () => {
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*--vp-motion-fast: 0ms[\s\S]*--vp-motion-base: 0ms/,
    );
  });

  it('defines the pop that greets a reached goal', () => {
    expect(css).toMatch(/@keyframes vp-pop/);
  });

  it('stops every animation and transition when reduced motion is on', () => {
    expect(css).toMatch(/animation-duration: 0ms !important/);
    expect(css).toMatch(/transition-duration: 0ms !important/);
  });

  it('draws the focus ring from tokens', () => {
    expect(css).toMatch(
      /:focus-visible[\s\S]*outline: 2px solid #3E7A4E[\s\S]*outline-offset: 2px/,
    );
  });
});
