import { NavLink } from '@mantine/core';
import { AppIcon, type IconName } from '../../icons/AppIcon';
import { tokens } from '../../tokens';

export interface NavItemProps {
  label: string;
  icon: IconName;
  active: boolean;
  onSelect: () => void;
}

export function NavItem({ label, icon, active, onSelect }: NavItemProps) {
  return (
    <NavLink
      component="button"
      type="button"
      label={label}
      leftSection={<AppIcon name={icon} />}
      active={active}
      aria-current={active ? 'page' : undefined}
      onClick={onSelect}
      mih={tokens.layout.minTouchTarget}
      variant="filled"
      color="sage.4"
      autoContrast
    />
  );
}
