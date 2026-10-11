import { hexToRgb } from './contrast';

interface Greens {
  primarySoft: string;
  primary: string;
  primaryStrong: string;
  text: string;
}

const WHITE = '#FFFFFF';
export const SAGE_PRIMARY_SHADE = 7;

function toHex(channels: number[]): string {
  return `#${channels
    .map((channel) => Math.round(channel).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`;
}

function mix(from: string, to: string, amount: number): string {
  const start = hexToRgb(from);
  const end = hexToRgb(to);
  return toHex(start.map((channel, index) => channel + (end[index]! - channel) * amount));
}

/**
 * Ten shades for Mantine, anchored on the three palette greens:
 * shade 1 = primarySoft, shade 4 = primary, shade 7 = primaryStrong (filled buttons).
 */
export function buildSageScale(greens: Greens): string[] {
  const { primarySoft, primary, primaryStrong, text } = greens;
  return [
    mix(primarySoft, WHITE, 0.5),
    primarySoft,
    mix(primarySoft, primary, 1 / 3),
    mix(primarySoft, primary, 2 / 3),
    primary,
    mix(primary, primaryStrong, 1 / 3),
    mix(primary, primaryStrong, 2 / 3),
    primaryStrong,
    mix(primaryStrong, text, 0.5),
    text,
  ];
}
