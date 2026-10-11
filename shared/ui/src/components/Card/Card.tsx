import { Paper, UnstyledButton } from '@mantine/core';
import type { ReactNode } from 'react';
import { tokens, type PillarColorName } from '../../tokens';
import { touchTarget } from '../touchTarget';

export type CardAccent = PillarColorName | 'primary';
export type CardTone = 'surface' | 'soft';

export interface CardProps {
  children: ReactNode;
  /** Highlighted variant: a coloured left border, e.g. the pillar of a PillarCard. */
  accent?: CardAccent;
  /** `soft` is the light green background of the weekend card. */
  tone?: CardTone;
  /** Makes the whole card one button; its content becomes the button's name. */
  onClick?: () => void;
}

const accentColor = (accent: CardAccent) =>
  accent === 'primary' ? 'var(--vp-color-primary)' : `var(--vp-color-pillar-${accent})`;

const background: Record<CardTone, string> = {
  surface: 'var(--vp-color-surface)',
  soft: 'var(--vp-color-primary-soft)',
};

/** Container with border, radius 12 and padding 16 (section 6.2). */
export function Card({ children, accent, tone = 'surface', onClick }: CardProps) {
  const paper = (
    <Paper
      withBorder
      radius="md"
      p="md"
      shadow="sm"
      data-accent={accent}
      style={{
        backgroundColor: background[tone],
        borderLeft: accent ? `${tokens.space[1]}px solid ${accentColor(accent)}` : undefined,
      }}
    >
      {children}
    </Paper>
  );
  if (!onClick) return paper;
  return (
    <UnstyledButton
      type="button"
      onClick={onClick}
      w="100%"
      bdrs="md"
      ta="start"
      style={{ display: 'block', minHeight: touchTarget.minHeight }}
    >
      {paper}
    </UnstyledButton>
  );
}
