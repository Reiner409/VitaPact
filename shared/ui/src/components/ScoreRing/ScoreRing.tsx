import { Stack, Text } from '@mantine/core';
import type { ReactNode } from 'react';
import { tokens } from '../../tokens';

export interface ScoreRingProps {
  /** Score from 0 to 100; it is rounded and kept inside that range. */
  score: number;
  /** Translated name of the score, e.g. "Week score". */
  label: string;
  /** Shown below the ring, usually a VerdictLabel. */
  children?: ReactNode;
}

const RING_SIZE = tokens.space[7] * 3;
const STROKE = tokens.space[2];
const RADIUS = (RING_SIZE - STROKE) / 2;
const CENTER = RING_SIZE / 2;

const ROTATE_TO_TOP = `rotate(-90 ${CENTER} ${CENTER})`;
const dashArray = (score: number) => `${score} 100`;

const toRingScore = (score: number) => Math.round(Math.min(100, Math.max(0, score)));

/** The large 0-100 score inside a ring, with the verdict below (section 6.2). */
export function ScoreRing({ score, label, children }: ScoreRingProps) {
  const shown = toRingScore(score);
  return (
    <Stack align="center" gap="xs">
      <div
        role="meter"
        aria-label={label}
        aria-valuenow={shown}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{ position: 'relative', width: RING_SIZE, height: RING_SIZE }}
      >
        <Ring score={shown} />
        <Text
          component="span"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            fontSize: tokens.font.display.size,
            lineHeight: `${tokens.font.display.lineHeight}px`,
            fontWeight: tokens.font.display.weight,
            fontVariantNumeric: tokens.font.numericVariant,
            color: 'var(--vp-color-text)',
          }}
        >
          {shown}
        </Text>
      </div>
      {children}
    </Stack>
  );
}

function Ring({ score }: { score: number }) {
  const circle = { cx: CENTER, cy: CENTER, r: RADIUS, fill: 'none', strokeWidth: STROKE };
  return (
    <svg width={RING_SIZE} height={RING_SIZE} aria-hidden="true" focusable="false">
      <circle {...circle} stroke="var(--vp-color-border)" />
      <circle
        {...circle}
        data-ring="progress"
        stroke="var(--vp-color-primary)"
        strokeLinecap={score > 0 ? 'round' : 'butt'}
        pathLength={100}
        strokeDasharray={dashArray(score)}
        transform={ROTATE_TO_TOP}
      />
    </svg>
  );
}
