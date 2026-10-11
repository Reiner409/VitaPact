import { ActionIcon } from '@mantine/core';
import { AppIcon, type IconName } from '../../icons/AppIcon';
import { tokens } from '../../tokens';
import { touchTarget } from '../touchTarget';

export type IconButtonVariant = 'subtle' | 'outline';

export interface IconButtonProps {
  icon: IconName;
  /** Translated name read by screen readers. */
  label: string;
  variant?: IconButtonVariant;
  disabled?: boolean;
  onClick?: () => void;
}

export function IconButton({
  icon,
  label,
  variant = 'subtle',
  disabled = false,
  onClick,
}: IconButtonProps) {
  return (
    <ActionIcon
      variant={variant}
      data-variant={variant}
      aria-label={label}
      size={tokens.layout.minTouchTarget}
      style={touchTarget}
      c="var(--vp-color-text)"
      disabled={disabled}
      onClick={onClick}
    >
      <AppIcon name={icon} />
    </ActionIcon>
  );
}
