import { describe, expect, it } from 'vitest';
import { tokens } from '../tokens';
import { vitaPactTheme, vitaPactCssVariablesResolver } from './theme';

describe('Mantine theme built from tokens (section 6.1)', () => {
  it('uses "sage" as the primary colour with primaryStrong on filled elements', () => {
    expect(vitaPactTheme.primaryColor).toBe('sage');
    const shade = vitaPactTheme.primaryShade as number;
    expect(vitaPactTheme.colors?.sage?.[shade]).toBe(tokens.color.primaryStrong);
  });

  it('defaults to the md radius and the Inter font', () => {
    expect(vitaPactTheme.defaultRadius).toBe('md');
    expect(vitaPactTheme.fontFamily).toBe(tokens.font.family);
  });

  it('maps spacing, radius and shadows to tokens', () => {
    expect(vitaPactTheme.radius).toMatchObject({ sm: '8px', md: '12px', lg: '16px' });
    expect(vitaPactTheme.spacing).toMatchObject({ xs: '8px', md: '16px', lg: '24px' });
    expect(vitaPactTheme.shadows).toMatchObject({
      sm: tokens.shadow.card,
      lg: tokens.shadow.modal,
    });
  });

  it('maps typography to tokens', () => {
    expect(vitaPactTheme.fontSizes).toMatchObject({ xs: '12px', sm: '14px' });
    expect(vitaPactTheme.headings?.sizes?.h1).toEqual({
      fontSize: '24px',
      lineHeight: '32px',
      fontWeight: '600',
    });
    expect(vitaPactTheme.headings?.sizes?.h2).toEqual({
      fontSize: '18px',
      lineHeight: '26px',
      fontWeight: '600',
    });
  });

  it('respects the reduced motion setting of the system', () => {
    expect(vitaPactTheme.respectReducedMotion).toBe(true);
  });

  it('places tokens on the light colour scheme and body background', () => {
    const resolved = vitaPactCssVariablesResolver(vitaPactTheme as never);
    expect(resolved.variables['--vp-color-bg']).toBe(tokens.color.bg);
    expect(resolved.light['--mantine-color-body']).toBe(tokens.color.bg);
    expect(resolved.light['--mantine-color-text']).toBe(tokens.color.text);
  });
});
