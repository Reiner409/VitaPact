import { Paper } from '@mantine/core';
import type { ReactNode } from 'react';
import { tokens, type PillarColorName } from '../../tokens';
import { accentColor } from '../pillarLook';
import { touchTarget } from '../touchTarget';

export type CardAccent = PillarColorName | 'primary';
export type CardTone = 'surface' | 'soft';

export interface CardProps {
  children: ReactNode;
  /** Highlighted variant: a coloured left border, e.g. the pillar of a PillarCard. */
  accent?: CardAccent;
  /** `soft` is the light green background of the weekend card. */
  tone?: CardTone;
  /**
   * Makes the whole card one button; its content becomes the button's name.
   * A clickable card therefore holds only text and icons, never buttons, fields or blocks.
   */
  onClick?: () => void;
}

const background: Record<CardTone, string> = {
  surface: 'var(--vp-color-surface)',
  soft: 'var(--vp-color-primary-soft)',
};

const buttonReset = { display: 'block', font: 'inherit', color: 'inherit', cursor: 'pointer' };

/** Container with border, radius 12 and padding 16 (section 6.2). */
export function Card({ children, accent, tone = 'surface', onClick }: CardProps) {
  const style = {
    backgroundColor: background[tone],
    borderLeft: accent ? `${tokens.space[1]}px solid ${accentColor(accent)}` : undefined,
  };
  const shared = { withBorder: true, radius: 'md', p: 'md', shadow: 'sm', 'data-accent': accent };
  if (!onClick) {
    return (
      <Paper {...shared} style={style}>
        {children}
      </Paper>
    );
  }
  return (
    <Paper
      {...shared}
      component="button"
      type="button"
      onClick={onClick}
      w="100%"
      ta="start"
      style={{ ...style, ...buttonReset, minHeight: touchTarget.minHeight }}
    >
      {children}
    </Paper>
  );
}
