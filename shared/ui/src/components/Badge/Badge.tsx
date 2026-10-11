import { Badge as MantineBadge } from '@mantine/core';
import type { ReactNode } from 'react';
import { tokens } from '../../tokens';

export type BadgeVariant = 'neutral' | 'comeback' | 'waiting';

export interface BadgeProps {
  /** The translated label. */
  children: ReactNode;
  variant?: BadgeVariant;
}

/** Every variant keeps dark text: 9.7:1 on light green, 4.6:1 for muted text on the sidebar tone. */
const looks: Record<BadgeVariant, { background: string; color: string }> = {
  neutral: { background: 'var(--vp-color-surface)', color: 'var(--vp-color-text)' },
  comeback: { background: 'var(--vp-color-primary-soft)', color: 'var(--vp-color-text)' },
  waiting: { background: 'var(--vp-color-sidebar)', color: 'var(--vp-color-text-muted)' },
};

export function Badge({ children, variant = 'neutral' }: BadgeProps) {
  const { background, color } = looks[variant];
  return (
    <MantineBadge
      data-variant={variant}
      radius="xl"
      size="lg"
      tt="none"
      fw={tokens.font.weight.medium}
      style={{
        backgroundColor: background,
        color,
        border: `${tokens.border.width}px solid var(--vp-color-border)`,
      }}
    >
      {children}
    </MantineBadge>
  );
}
