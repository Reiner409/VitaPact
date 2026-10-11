import { Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { AppIcon, type IconName } from '../../icons/AppIcon';
import { tokens } from '../../tokens';
import { Button } from '../Button/Button';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

export interface EmptyStateProps {
  icon: IconName;
  /** The translated phrase. */
  title: string;
  description?: string;
  action?: EmptyStateAction;
}

/** What an empty screen shows: icon, phrase and, optionally, the action that fills it. */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Stack align="center" gap="sm" py="xl" ta="center">
      <ThemeIcon
        size={tokens.space[7]}
        radius="xl"
        color="var(--vp-color-primary-soft)"
        c="var(--vp-color-text)"
      >
        <AppIcon name={icon} />
      </ThemeIcon>
      <Title order={2}>{title}</Title>
      {description && <Text c="var(--vp-color-text-muted)">{description}</Text>}
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </Stack>
  );
}
