import { Group, Text } from '@mantine/core';
import type { ReactNode } from 'react';
import { AppIcon, type IconName } from '../../icons/AppIcon';
import { tokens } from '../../tokens';

export type BannerTone = 'warning' | 'info';

export interface BannerProps {
  tone: BannerTone;
  /** The translated message. */
  children: ReactNode;
  icon?: IconName;
  action?: ReactNode;
}

const background: Record<BannerTone, string> = {
  warning: 'var(--vp-color-warning)',
  info: 'var(--vp-color-primary-soft)',
};

/** Message at the top of the content, e.g. the weigh-in reminder. Text stays dark on both tones. */
export function Banner({ tone, children, icon, action }: BannerProps) {
  return (
    <Group
      role="status"
      data-tone={tone}
      justify="space-between"
      wrap="nowrap"
      gap="sm"
      px="md"
      py="sm"
      mb="lg"
      bdrs="md"
      style={{ backgroundColor: background[tone], color: 'var(--vp-color-text)' }}
    >
      <Group gap="sm" wrap="nowrap">
        {icon && <AppIcon name={icon} />}
        <Text component="span" fw={tokens.font.weight.medium}>
          {children}
        </Text>
      </Group>
      {action}
    </Group>
  );
}
