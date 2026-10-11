import { AppShell as MantineAppShell, Box } from '@mantine/core';
import type { ReactNode } from 'react';
import { tokens } from '../../tokens';
import { NavItem, type NavItemProps } from '../NavItem/NavItem';

export interface AppShellNavItem extends NavItemProps {
  id: string;
}

export interface AppShellProps {
  /** Accessible name of the navigation landmark (an i18n string). */
  navLabel: string;
  navItems: AppShellNavItem[];
  /** Slot above the content, e.g. the weigh-in banner (F3-TD-09). */
  banner?: ReactNode;
  children: ReactNode;
}

/**
 * Provisional frame created by F1-01 so the app can navigate.
 * F2-16 owns the final version (bottom bar under 768 px); the props above are the contract.
 */
export function AppShell({ navLabel, navItems, banner, children }: AppShellProps) {
  return (
    <MantineAppShell navbar={{ width: tokens.layout.sidebarWidth, breakpoint: 0 }} padding="lg">
      <MantineAppShell.Navbar
        component="nav"
        aria-label={navLabel}
        p="sm"
        bg="var(--vp-color-sidebar)"
      >
        {navItems.map(({ id, ...item }) => (
          <NavItem key={id} {...item} />
        ))}
      </MantineAppShell.Navbar>
      <MantineAppShell.Main>
        {banner}
        <Box component="main" maw={tokens.layout.contentMaxWidth}>
          {children}
        </Box>
      </MantineAppShell.Main>
    </MantineAppShell>
  );
}
