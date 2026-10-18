import { Box, Group } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import type { ReactNode } from 'react';
import { tokens } from '../../tokens';

const { splitBreakpoint, splitListWidth } = tokens.layout;
const SPLIT_WINDOW = `(min-width: ${splitBreakpoint}px)`;

/** True when the window is wide enough for a list and its detail side by side. */
export function useSplitLayout(): boolean {
  return useMediaQuery(SPLIT_WINDOW, false, { getInitialValueInEffect: false });
}

export interface SplitViewProps {
  list: ReactNode;
  /** The open item; `undefined` when nothing is open. */
  detail?: ReactNode;
  /** Shown beside the list on a wide window while nothing is open. */
  placeholder?: ReactNode;
}

/**
 * A list with its detail (RF-29): side by side on a wide window, one at a time on a narrow one,
 * where the open detail takes the place of the list.
 */
export function SplitView({ list, detail, placeholder }: SplitViewProps) {
  const split = useSplitLayout();
  if (!split) return <>{detail ?? list}</>;
  const side = detail ?? placeholder;
  return (
    <Group align="flex-start" gap="lg" wrap="nowrap" data-layout="split">
      <Box w={side ? splitListWidth : '100%'} style={{ flexShrink: 0 }}>
        {list}
      </Box>
      {side && (
        <Box flex={1} miw={0}>
          {side}
        </Box>
      )}
    </Group>
  );
}
