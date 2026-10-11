import { Group, Stack, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

/** Screen title with an optional subtitle, and an optional action on the right. */
export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md" mb="lg">
      <Stack gap={0}>
        <Title order={1}>{title}</Title>
        {subtitle && <Text c="var(--vp-color-text-muted)">{subtitle}</Text>}
      </Stack>
      {action}
    </Group>
  );
}
