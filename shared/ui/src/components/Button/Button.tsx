import { Button as MantineButton, type ButtonProps as MantineButtonProps } from '@mantine/core';
import type { ReactNode } from 'react';
import { AppIcon, type IconName } from '../../icons/AppIcon';
import { touchTarget } from '../touchTarget';

export type ButtonVariant = 'primary' | 'secondary' | 'subtle' | 'destructive';

export interface ButtonProps {
  /** The translated label. */
  children: ReactNode;
  variant?: ButtonVariant;
  icon?: IconName;
  type?: 'button' | 'submit';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
}

/**
 * Destructive buttons keep dark text and a clay outline: neither white nor dark text
 * reaches 4.5:1 on a clay fill (G4.3, RNF-10).
 */
const looks: Record<ButtonVariant, Partial<MantineButtonProps>> = {
  primary: { variant: 'filled' },
  secondary: { variant: 'outline' },
  subtle: { variant: 'subtle' },
  destructive: { variant: 'outline', color: 'var(--vp-color-danger)', c: 'var(--vp-color-text)' },
};

export function Button({
  children,
  variant = 'primary',
  icon,
  type = 'button',
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
}: ButtonProps) {
  return (
    <MantineButton
      {...looks[variant]}
      data-variant={variant}
      type={type}
      loading={loading}
      aria-busy={loading || undefined}
      disabled={disabled}
      fullWidth={fullWidth}
      leftSection={icon ? <AppIcon name={icon} /> : undefined}
      style={{ minHeight: touchTarget.minHeight }}
      fw={500}
      onClick={onClick}
    >
      {children}
    </MantineButton>
  );
}
