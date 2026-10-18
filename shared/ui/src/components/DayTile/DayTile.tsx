import { Group, Stack, Text, VisuallyHidden } from '@mantine/core';
import { tokens } from '../../tokens';
import { touchTarget } from '../touchTarget';
import { BandDot } from '../BandDot';
import { Card } from '../Card/Card';
import type { ScoreBand } from '../scoreBand';

export interface DayTileProps {
  /** Translated short name of the day, e.g. "Mon". */
  dayName: string;
  /** The day's score from 0 to 100, or `null` when the day was not logged. */
  score: number | null;
  band: ScoreBand | null;
  /** Translated text shown instead of the score, e.g. "Not logged". */
  missingLabel: string;
  /** Translated "Today", shown only on today's tile. */
  todayLabel: string;
  today?: boolean;
  /**
   * Phone layout: seven tiles fit one row, so the tile shows the day, its dot and the score only.
   * The missing and today labels stay in the button's name for screen readers.
   */
  compact?: boolean;
  onClick: () => void;
}

type TileContentProps = Omit<DayTileProps, 'onClick' | 'compact'> & { logged: boolean };

function CompactContent({
  dayName,
  score,
  band,
  missingLabel,
  todayLabel,
  today,
  logged,
}: TileContentProps) {
  return (
    <Stack
      component="span"
      gap={tokens.space[1]}
      align="center"
      style={{ minWidth: touchTarget.minWidth }}
    >
      <Text component="span" display="block" size="sm" fw={tokens.font.weight.semibold}>
        {dayName}
      </Text>
      <BandDot band={band} />
      {logged ? (
        <Text
          component="span"
          display="block"
          size="sm"
          fw={tokens.font.weight.semibold}
          style={{ fontVariantNumeric: tokens.font.numericVariant }}
        >
          {Math.round(score ?? 0)}
        </Text>
      ) : (
        <VisuallyHidden display="block">{missingLabel}</VisuallyHidden>
      )}
      {today && <VisuallyHidden display="block">{todayLabel}</VisuallyHidden>}
    </Stack>
  );
}

function FullContent({
  dayName,
  score,
  band,
  missingLabel,
  todayLabel,
  today,
  logged,
}: TileContentProps) {
  return (
    <>
      <Text component="span" display="block" fw={tokens.font.weight.semibold}>
        {dayName}
      </Text>
      <Group component="span" gap="xs" wrap="nowrap" mt={tokens.space[1]}>
        <BandDot band={band} />
        <Text
          component="span"
          // The missing label is a phrase, smaller so it fits a quarter of a phone screen.
          size={logged ? 'md' : 'sm'}
          miw={0}
          fw={logged ? tokens.font.weight.semibold : tokens.font.weight.regular}
          c={logged ? 'var(--vp-color-text)' : 'var(--vp-color-text-muted)'}
          style={{ fontVariantNumeric: tokens.font.numericVariant }}
        >
          {logged ? Math.round(score ?? 0) : missingLabel}
        </Text>
      </Group>
      {today && (
        <Text component="span" display="block" size="xs" fw={tokens.font.weight.medium}>
          {todayLabel}
        </Text>
      )}
    </>
  );
}

/** One day of the week with its score; clicking opens the day (section 5.3). */
export function DayTile({ onClick, compact = false, today = false, ...day }: DayTileProps) {
  const content = { ...day, today, logged: day.score !== null };
  return (
    <Card onClick={onClick} dense={compact} {...(today ? { accent: 'primary' } : {})}>
      {compact ? <CompactContent {...content} /> : <FullContent {...content} />}
    </Card>
  );
}
