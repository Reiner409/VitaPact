import { appIcons, type IconName } from '../icons/AppIcon';
import { tokens, type PillarColorName } from '../tokens';
import type { CardAccent } from './Card/Card';

const isPillarColor = (name: string): name is PillarColorName =>
  Object.hasOwn(tokens.color.pillar, name);
const isIconName = (name: string): name is IconName => Object.hasOwn(appIcons, name);

/**
 * A pillar names its colour and icon (core's pillar module). A new pillar without its own
 * design tokens yet still shows, in the primary green with the generic pillar icon (RF-23).
 */
export function pillarLook(pillar: { color: string; icon: string }): {
  accent: CardAccent;
  icon: IconName;
} {
  return {
    accent: isPillarColor(pillar.color) ? pillar.color : 'primary',
    icon: isIconName(pillar.icon) ? pillar.icon : 'pillar',
  };
}

export const accentColor = (accent: CardAccent) =>
  accent === 'primary' ? 'var(--vp-color-primary)' : `var(--vp-color-pillar-${accent})`;
