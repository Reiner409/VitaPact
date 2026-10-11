import type { Tokens } from './tokens';

type CssVariables = Record<`--vp-${string}`, string>;

const px = (value: number) => `${value}px`;
const ms = (value: number) => `${value}ms`;
const kebab = (name: string) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

function prefixed(
  group: string,
  values: Record<string, string | number>,
  unit: (value: number) => string,
) {
  return Object.fromEntries(
    Object.entries(values).map(([name, value]) => [
      `--vp-${group}-${kebab(name)}`,
      typeof value === 'number' ? unit(value) : value,
    ]),
  ) as CssVariables;
}

export function buildCssVariables(tokens: Tokens): CssVariables {
  const { pillar, ...baseColors } = tokens.color;
  return {
    ...prefixed('color', baseColors, px),
    ...prefixed('color-pillar', pillar, px),
    ...prefixed('space', tokens.space, px),
    ...prefixed('radius', tokens.radius, px),
    ...prefixed('shadow', tokens.shadow, px),
    ...prefixed('motion', tokens.motion, ms),
    ...prefixed('layout', tokens.layout, px),
  };
}

/** Global rules that cannot live in the Mantine theme: focus ring and reduced motion. */
export function buildGlobalCss(tokens: Tokens): string {
  return `
:focus-visible {
  outline: ${px(tokens.focus.width)} solid ${tokens.focus.color};
  outline-offset: ${px(tokens.focus.offset)};
}
@media (prefers-reduced-motion: reduce) {
  :root {
    --vp-motion-fast: 0ms;
    --vp-motion-base: 0ms;
  }
  *, *::before, *::after {
    animation-duration: 0ms !important;
    transition-duration: 0ms !important;
    scroll-behavior: auto !important;
  }
}
`;
}
