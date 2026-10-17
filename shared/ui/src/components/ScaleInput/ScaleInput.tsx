import { Group, Text, UnstyledButton } from '@mantine/core';
import { useId, useRef, type KeyboardEvent } from 'react';
import { tokens } from '../../tokens';
import { touchTarget } from '../touchTarget';

export type ScaleValue = 1 | 2 | 3 | 4 | 5;

export interface ScaleInputProps {
  label: string;
  value: ScaleValue | null;
  onChange: (value: ScaleValue) => void;
  /** Translated name of each dot, e.g. "3 of 5". */
  getValueLabel: (value: ScaleValue) => string;
}

const SCALE: ScaleValue[] = [1, 2, 3, 4, 5];

/**
 * One face per step, from crying to beaming, the same for every 1-5 rating in the app.
 * The faces are decoration: each button is named by `getValueLabel`.
 */
export const SCALE_FACES: Record<ScaleValue, string> = {
  1: '\u{1F62D}',
  2: '\u{1F61F}',
  3: '\u{1F610}',
  4: '\u{1F642}',
  5: '\u{1F601}',
};
const clampToScale = (value: number) => Math.min(5, Math.max(1, value)) as ScaleValue;

const keySteps: Record<string, (current: number) => number> = {
  ArrowRight: (current) => current + 1,
  ArrowUp: (current) => current + 1,
  ArrowLeft: (current) => current - 1,
  ArrowDown: (current) => current - 1,
  Home: () => 1,
  End: () => 5,
};

/** One to five faces, a radio group: Tab reaches it, arrows, Home and End move the choice. */
export function ScaleInput({ label, value, onChange, getValueLabel }: ScaleInputProps) {
  const labelId = useId();
  const dots = useRef<Array<HTMLButtonElement | null>>([]);
  const focusable = value ?? 1;

  const select = (next: ScaleValue) => {
    dots.current[next - 1]?.focus();
    if (next !== value) onChange(next);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const step = keySteps[event.key];
    if (!step) return;
    event.preventDefault();
    select(clampToScale(step(focusable)));
  };

  return (
    <div>
      <Text id={labelId} fw={tokens.font.weight.medium} mb={tokens.space[1]}>
        {label}
      </Text>
      <Group role="radiogroup" aria-labelledby={labelId} gap={0} onKeyDown={onKeyDown}>
        {SCALE.map((dot) => (
          <UnstyledButton
            key={dot}
            ref={(element) => {
              dots.current[dot - 1] = element;
            }}
            role="radio"
            aria-checked={value === dot}
            aria-label={getValueLabel(dot)}
            tabIndex={dot === focusable ? 0 : -1}
            onClick={() => select(dot)}
            style={{ ...touchTarget, display: 'grid', placeItems: 'center', borderRadius: '50%' }}
          >
            <ScaleFace value={dot} selected={value === dot} />
          </UnstyledButton>
        ))}
      </Group>
    </div>
  );
}

/** Faces not chosen stay visible but step back. */
const FADED_OPACITY = 0.55;

function ScaleFace({ value, selected }: { value: ScaleValue; selected: boolean }) {
  const size = touchTarget.minHeight;
  return (
    <span
      aria-hidden="true"
      data-selected={selected}
      style={{
        display: 'grid',
        placeItems: 'center',
        width: size,
        height: size,
        borderRadius: '50%',
        fontSize: tokens.font.h1.size,
        lineHeight: 1,
        border: `${tokens.border.strongWidth}px solid ${selected ? 'var(--vp-color-primary-strong)' : 'transparent'}`,
        backgroundColor: selected ? 'var(--vp-color-primary-soft)' : 'transparent',
        // Faces not chosen turn grey, so the choice reads at a glance.
        filter: selected ? 'none' : 'grayscale(1)',
        opacity: selected ? 1 : FADED_OPACITY,
        transition: `opacity var(--vp-motion-fast) ${tokens.motion.easing}`,
      }}
    >
      {SCALE_FACES[value]}
    </span>
  );
}
