import { createTheme, type CSSVariablesResolver, type MantineColorsTuple } from '@mantine/core';
import { buildCssVariables, buildSageScale, SAGE_PRIMARY_SHADE, tokens } from '../tokens';

const px = (value: number) => `${value}px`;

const heading = (font: { size: number; lineHeight: number; weight: number }) => ({
  fontSize: px(font.size),
  lineHeight: px(font.lineHeight),
  fontWeight: String(font.weight),
});

export const vitaPactTheme = createTheme({
  primaryColor: 'sage',
  primaryShade: SAGE_PRIMARY_SHADE,
  colors: {
    sage: buildSageScale(tokens.color) as unknown as MantineColorsTuple,
  },
  white: tokens.color.surface,
  black: tokens.color.text,
  fontFamily: tokens.font.family,
  headings: {
    fontFamily: tokens.font.family,
    sizes: { h1: heading(tokens.font.h1), h2: heading(tokens.font.h2) },
  },
  fontSizes: {
    xs: px(tokens.font.small.size),
    sm: px(tokens.font.body.size),
    md: px(tokens.font.body.size),
    lg: px(tokens.font.h2.size),
    xl: px(tokens.font.h1.size),
  },
  lineHeights: {
    xs: px(tokens.font.small.lineHeight),
    sm: px(tokens.font.body.lineHeight),
    md: px(tokens.font.body.lineHeight),
    lg: px(tokens.font.h2.lineHeight),
    xl: px(tokens.font.h1.lineHeight),
  },
  spacing: {
    xs: px(tokens.space[2]),
    sm: px(tokens.space[3]),
    md: px(tokens.space[4]),
    lg: px(tokens.space[5]),
    xl: px(tokens.space[6]),
  },
  radius: {
    xs: px(tokens.radius.sm),
    sm: px(tokens.radius.sm),
    md: px(tokens.radius.md),
    lg: px(tokens.radius.lg),
    xl: px(tokens.radius.full),
  },
  defaultRadius: 'md',
  shadows: {
    xs: tokens.shadow.card,
    sm: tokens.shadow.card,
    md: tokens.shadow.card,
    lg: tokens.shadow.modal,
    xl: tokens.shadow.modal,
  },
  breakpoints: {
    xs: '22.5em',
    sm: `${tokens.layout.mobileBreakpoint / 16}em`,
    md: '64em',
    lg: '75em',
    xl: '88em',
  },
  respectReducedMotion: true,
  focusRing: 'never',
  cursorType: 'pointer',
});

export const vitaPactCssVariablesResolver: CSSVariablesResolver = () => ({
  variables: buildCssVariables(tokens),
  light: {
    '--mantine-color-body': tokens.color.bg,
    '--mantine-color-text': tokens.color.text,
    '--mantine-color-dimmed': tokens.color.textMuted,
    '--mantine-color-default-border': tokens.color.border,
    '--mantine-color-error': tokens.color.danger,
  },
  dark: {},
});
