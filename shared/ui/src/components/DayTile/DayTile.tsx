import { Group, Text } from '@mantine/core';
import { tokens } from '../../tokens';
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
  onClick: () => void;
}

/** One day of the week with its score; clicking opens the day (section 5.3). */
export function DayTile({
  dayName,
  score,
  band,
  missingLabel,
  todayLabel,
  today = false,
  onClick,
}: DayTileProps) {
  const logged = score !== null;
  return (
    <Card onClick={onClick} {...(today ? { accent: 'primary' } : {})}>
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
          {logged ? Math.round(score) : missingLabel}
        </Text>
      </Group>
      {today && (
        <Text component="span" display="block" size="xs" fw={tokens.font.weight.medium}>
          {todayLabel}
        </Text>
      )}
    </Card>
  );
}
