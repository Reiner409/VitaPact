import { Group, Stack as MantineStack, SimpleGrid } from '@mantine/core';
import type { ReactNode } from 'react';
import { tokens } from '../../tokens';

export type StackGap = 'tight' | 'normal' | 'loose';

export interface StackProps {
  children: ReactNode;
  /** tight 8, normal 16, loose 24 (section 6.1 spacing scale). */
  gap?: StackGap;
  /** Side by side, wrapping on narrow windows, e.g. a row of buttons. */
  horizontal?: boolean;
  /** Equal columns on wide windows, two on tablets and one on phones, e.g. the four pillars. */
  columns?: number;
}

const gaps: Record<StackGap, number> = {
  tight: tokens.space[2],
  normal: tokens.space[4],
  loose: tokens.space[5],
};

/** Puts blocks one under the other with a token gap, so screens never set their own margins. */
export function Stack({ children, gap = 'normal', horizontal = false, columns }: StackProps) {
  if (columns !== undefined) {
    return (
      <SimpleGrid cols={{ base: 1, xs: 2, md: columns }} spacing={gaps[gap]} data-gap={gap}>
        {children}
      </SimpleGrid>
    );
  }
  const Layout = horizontal ? Group : MantineStack;
  return (
    <Layout gap={gaps[gap]} data-gap={gap}>
      {children}
    </Layout>
  );
}
