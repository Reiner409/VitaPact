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
const clampToScale = (value: number) => Math.min(5, Math.max(1, value)) as ScaleValue;

const keySteps: Record<string, (current: number) => number> = {
  ArrowRight: (current) => current + 1,
  ArrowUp: (current) => current + 1,
  ArrowLeft: (current) => current - 1,
  ArrowDown: (current) => current - 1,
  Home: () => 1,
  End: () => 5,
};

/** One to five dots, a radio group: Tab reaches it, arrows, Home and End move the choice. */
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
            <ScaleDot filled={value !== null && dot <= value} />
          </UnstyledButton>
        ))}
      </Group>
    </div>
  );
}

function ScaleDot({ filled }: { filled: boolean }) {
  const size = tokens.space[4];
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `${tokens.border.strongWidth}px solid var(--vp-color-primary-strong)`,
        backgroundColor: filled ? 'var(--vp-color-primary-strong)' : 'var(--vp-color-surface)',
        transition: `background-color var(--vp-motion-fast) ${tokens.motion.easing}`,
      }}
    />
  );
}
