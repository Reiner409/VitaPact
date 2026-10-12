import { Group, Stack, Text } from '@mantine/core';
import { AppIcon } from '../../icons/AppIcon';
import { tokens } from '../../tokens';
import { Card } from '../Card/Card';
import { accentColor, pillarLook } from '../pillarLook';

export interface PillarSummaryProps {
  /** The pillar's colour and icon names, as the pillar module declares them. */
  pillar: { color: string; icon: string };
  /** Translated pillar name. */
  name: string;
  /** Translated weekly average with its unit, e.g. "7.2 h average". */
  averageLabel: string;
  daysOnGoal: number;
  /** Translated days on target, e.g. "5 of 7 days on target". */
  daysOnGoalLabel: string;
}

const DAYS_IN_WEEK = 7;

const barWidth = (daysOnGoal: number) =>
  `${Math.round((Math.min(DAYS_IN_WEEK, Math.max(0, daysOnGoal)) / DAYS_IN_WEEK) * 100)}%`;

/** One pillar's week: average and days on target; the pillar colour marks only icon and bar. */
export function PillarSummary({
  pillar,
  name,
  averageLabel,
  daysOnGoal,
  daysOnGoalLabel,
}: PillarSummaryProps) {
  const { accent, icon } = pillarLook(pillar);
  const color = accentColor(accent);
  return (
    <Card accent={accent}>
      <Stack gap="xs">
        <Group justify="space-between" wrap="wrap" gap="xs">
          <Group gap="xs" wrap="nowrap">
            <span style={{ color, display: 'inline-flex' }}>
              <AppIcon name={icon} />
            </span>
            <Text fw={tokens.font.weight.semibold}>{name}</Text>
          </Group>
          <Text
            style={{
              color: 'var(--vp-color-text)',
              fontVariantNumeric: tokens.font.numericVariant,
            }}
          >
            {averageLabel}
          </Text>
        </Group>
        <DaysBar color={color} width={barWidth(daysOnGoal)} />
        <Text size="xs" c="var(--vp-color-text-muted)">
          {daysOnGoalLabel}
        </Text>
      </Stack>
    </Card>
  );
}

function DaysBar({ color, width }: { color: string; width: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        height: tokens.space[2],
        borderRadius: tokens.radius.full,
        backgroundColor: 'var(--vp-color-border)',
        overflow: 'hidden',
      }}
    >
      <div data-bar="days-on-goal" style={{ height: '100%', width, backgroundColor: color }} />
    </div>
  );
}
