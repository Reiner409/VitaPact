import { Stack, Text, UnstyledButton } from '@mantine/core';
import { AppIcon, type IconName } from '../../icons/AppIcon';
import { tokens } from '../../tokens';
import { touchTarget } from '../touchTarget';

export type NavPlacement = 'sidebar' | 'bottomBar';

export interface NavItemProps {
  label: string;
  icon: IconName;
  active: boolean;
  onSelect: () => void;
  placement?: NavPlacement;
}

/** Menu entry: icon beside the label in the sidebar, icon above a small label in the bottom bar. */
export function NavItem({ label, icon, active, onSelect, placement = 'sidebar' }: NavItemProps) {
  const inBottomBar = placement === 'bottomBar';
  return (
    <UnstyledButton
      type="button"
      aria-current={active ? 'page' : undefined}
      onClick={onSelect}
      {...(inBottomBar ? { flex: 1, py: 'xs' } : { w: '100%' })}
      px="sm"
      bdrs="md"
      c="var(--vp-color-text)"
      style={{
        ...touchTarget,
        display: 'flex',
        alignItems: 'center',
        backgroundColor: active ? 'var(--vp-color-primary)' : undefined,
      }}
    >
      <Stack
        gap={inBottomBar ? tokens.space[1] : 'sm'}
        align="center"
        justify={inBottomBar ? 'center' : 'flex-start'}
        w="100%"
        style={{ flexDirection: inBottomBar ? 'column' : 'row' }}
      >
        <AppIcon name={icon} />
        <Text component="span" size={inBottomBar ? 'xs' : 'sm'} fw={active ? 600 : 500}>
          {label}
        </Text>
      </Stack>
    </UnstyledButton>
  );
}
