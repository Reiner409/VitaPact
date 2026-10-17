import { Group, Text } from '@mantine/core';
import { useId } from 'react';
import { tokens } from '../../tokens';
import { Badge } from '../Badge/Badge';
import { Card } from '../Card/Card';

export interface RankingListRow {
  /** Stable key, e.g. the member's user id. */
  id: string;
  /** `null` for someone still waiting, who has no place in the ranking (RF-14). */
  position: number | null;
  /** A nickname from a friend's report: always rendered as text, never as HTML (RNF-05). */
  name: string;
  you?: boolean;
  /** Translated main figure, e.g. "62" or "58.5 average". */
  value?: string;
  /** Translated secondary lines, e.g. the verdict and the weight change. */
  details?: readonly string[];
  /** Translated comeback mark, e.g. "Comeback +28 points"; the row is highlighted (RF-27). */
  comeback?: string;
  /** Translated "Waiting", shown instead of a score (RF-14). */
  waiting?: string;
  /** Opens the member's history (RF-13); the whole row becomes a button. */
  onSelect?: () => void;
}

export interface RankingListProps {
  /** Translated title shown above the list, which also names it. */
  label: string;
  /** Translated "You", shown on your own row. */
  youLabel: string;
  rows: readonly RankingListRow[];
}

function RowBadges({ row }: { row: RankingListRow }) {
  if (row.comeback === undefined && row.waiting === undefined) return null;
  return (
    <Group component="span" mt={tokens.space[1]}>
      {row.comeback !== undefined && <Badge variant="comeback">{row.comeback}</Badge>}
      {row.waiting !== undefined && <Badge variant="waiting">{row.waiting}</Badge>}
    </Group>
  );
}

function RowContent({ row, youLabel }: { row: RankingListRow; youLabel: string }) {
  const numeric = { fontVariantNumeric: tokens.font.numericVariant };
  return (
    <>
      <Group component="span" justify="space-between" wrap="nowrap" gap="sm">
        <Group component="span" gap="sm" wrap="nowrap" miw={0}>
          {row.position !== null && (
            <Text component="span" c="var(--vp-color-text-muted)" style={numeric}>
              {row.position}
            </Text>
          )}
          <Text component="span" fw={tokens.font.weight.semibold} truncate>
            {row.name}
          </Text>
          {row.you && <Badge>{youLabel}</Badge>}
        </Group>
        {row.value !== undefined && (
          <Text component="span" fw={tokens.font.weight.semibold} style={numeric}>
            {row.value}
          </Text>
        )}
      </Group>
      {row.details?.map((detail) => (
        <Text
          key={detail}
          component="span"
          display="block"
          size="sm"
          c="var(--vp-color-text-muted)"
        >
          {detail}
        </Text>
      ))}
      <RowBadges row={row} />
    </>
  );
}

/** RF-13: a ranking, one card per member; "You" always has a row (section 5.4). */
export function RankingList({ label, youLabel, rows }: RankingListProps) {
  const titleId = useId();
  return (
    <section aria-labelledby={titleId}>
      <Text id={titleId} component="h2" fw={tokens.font.weight.semibold} mb={tokens.space[2]}>
        {label}
      </Text>
      <ol aria-labelledby={titleId} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {rows.map((row) => (
          <li key={row.id} style={{ marginBottom: tokens.space[2] }}>
            <Card
              {...(row.comeback !== undefined ? { accent: 'primary' as const } : {})}
              {...(row.onSelect ? { onClick: row.onSelect } : {})}
            >
              <RowContent row={row} youLabel={youLabel} />
            </Card>
          </li>
        ))}
      </ol>
    </section>
  );
}
