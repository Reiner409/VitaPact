const color = {
  bg: '#F5F0E6',
  surface: '#FFFDF8',
  sidebar: '#EDE4D3',
  border: '#E2D8C5',
  text: '#2F3B2F',
  textMuted: '#5E6858',
  primary: '#8FC79A',
  primaryStrong: '#3E7A4E',
  primarySoft: '#DCEFD6',
  warning: '#E3B25A',
  danger: '#C97B66',
  pillar: {
    sleep: '#A3A1D9',
    training: '#E8A07E',
    food: '#9CC77A',
    sun: '#EBC06A',
  },
} as const;

/**
 * The single source of every visual value in VitaPact (requirements section 6.1).
 * Sizes are unitless pixel numbers; the Mantine theme and the CSS variables are generated from here.
 */
export const tokens = {
  color,
  space: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 24, 6: 32, 7: 48 },
  radius: { sm: 8, md: 12, lg: 16, full: 9999 },
  shadow: {
    card: '0 1px 2px rgba(47, 59, 47, 0.06)',
    modal: '0 8px 24px rgba(47, 59, 47, 0.12)',
  },
  motion: { fast: 150, base: 250, easing: 'ease-out' },
  timing: { toast: 4000 },
  focus: { width: 2, offset: 2, color: color.primaryStrong },
  layout: {
    sidebarWidth: 240,
    bottomBarHeight: 64,
    contentMaxWidth: 960,
    mobileBreakpoint: 768,
    minTouchTarget: 44,
  },
  font: {
    family: "'Inter Variable', 'Segoe UI', system-ui, sans-serif",
    numericVariant: 'tabular-nums',
    display: { size: 48, lineHeight: 56, weight: 700 },
    h1: { size: 24, lineHeight: 32, weight: 600 },
    h2: { size: 18, lineHeight: 26, weight: 600 },
    body: { size: 14, lineHeight: 20, weight: 400 },
    small: { size: 12, lineHeight: 16, weight: 500 },
  },
  icon: { size: 20, stroke: 1.75 },
} as const;

export type Tokens = typeof tokens;
export type PillarColorName = keyof Tokens['color']['pillar'];
