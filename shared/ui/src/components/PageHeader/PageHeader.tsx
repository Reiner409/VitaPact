import { Group, Stack, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

/** Provisional header created by F1-01; F2-16 owns the final version. */
export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <Group justify="space-between" align="flex-start" mb="lg">
      <Stack gap={0}>
        <Title order={1}>{title}</Title>
        {subtitle && <Text c="dimmed">{subtitle}</Text>}
      </Stack>
      {action}
    </Group>
  );
}
