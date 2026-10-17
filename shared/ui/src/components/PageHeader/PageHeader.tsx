import { Group, Stack, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';
import { tokens } from '../../tokens';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** A short line above the title, such as a greeting. */
  greeting?: string | undefined;
  action?: ReactNode;
}

/** Screen title with an optional greeting and subtitle, and an optional action on the right. */
export function PageHeader({ title, subtitle, greeting, action }: PageHeaderProps) {
  return (
    <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md" mb="lg">
      <Stack gap={0}>
        {greeting && (
          <Text fw={tokens.font.weight.semibold} c="var(--vp-color-primary-strong)">
            {greeting}
          </Text>
        )}
        <Title order={1}>{title}</Title>
        {subtitle && <Text c="var(--vp-color-text-muted)">{subtitle}</Text>}
      </Stack>
      {action}
    </Group>
  );
}
