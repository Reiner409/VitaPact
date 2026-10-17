import { Stack as MantineStack } from '@mantine/core';
import type { ReactNode } from 'react';
import { tokens } from '../../tokens';

export type StackGap = 'tight' | 'normal' | 'loose';

export interface StackProps {
  children: ReactNode;
  /** tight 8, normal 16, loose 24 (section 6.1 spacing scale). */
  gap?: StackGap;
}

const gaps: Record<StackGap, number> = {
  tight: tokens.space[2],
  normal: tokens.space[4],
  loose: tokens.space[5],
};

/** Puts blocks one under the other with a token gap, so screens never set their own margins. */
export function Stack({ children, gap = 'normal' }: StackProps) {
  return (
    <MantineStack gap={gaps[gap]} data-gap={gap}>
      {children}
    </MantineStack>
  );
}
