import { AppShell as MantineAppShell, Box, Group, Stack } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import type { ReactNode } from 'react';
import { tokens } from '../../tokens';
import { NavItem, type NavItemProps, type NavPlacement } from '../NavItem/NavItem';

export interface AppShellNavItem extends Omit<NavItemProps, 'placement'> {
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

const { sidebarWidth, bottomBarHeight, contentMaxWidth, mobileBreakpoint } = tokens.layout;
const WIDE_WINDOW = `(min-width: ${mobileBreakpoint}px)`;

function NavItems({ items, placement }: { items: AppShellNavItem[]; placement: NavPlacement }) {
  return items.map(({ id, ...item }) => <NavItem key={id} placement={placement} {...item} />);
}

/** App frame (RF-29): sidebar from 768 px up, bottom bar below. */
export function AppShell({ navLabel, navItems, banner, children }: AppShellProps) {
  const wide = useMediaQuery(WIDE_WINDOW, true, { getInitialValueInEffect: false });
  const placement: NavPlacement = wide ? 'sidebar' : 'bottomBar';
  const navProps = { component: 'nav', 'aria-label': navLabel, 'data-placement': placement };

  return (
    <MantineAppShell
      {...(wide
        ? { navbar: { width: sidebarWidth, breakpoint: 0 } }
        : { footer: { height: bottomBarHeight } })}
      padding="lg"
    >
      {wide ? (
        <MantineAppShell.Navbar {...navProps} p="sm" bg="var(--vp-color-sidebar)" withBorder>
          <Stack gap={tokens.space[1]}>
            <NavItems items={navItems} placement={placement} />
          </Stack>
        </MantineAppShell.Navbar>
      ) : (
        <MantineAppShell.Footer {...navProps} px="xs" bg="var(--vp-color-sidebar)" withBorder>
          <Group h="100%" gap={tokens.space[1]} wrap="nowrap" align="center">
            <NavItems items={navItems} placement={placement} />
          </Group>
        </MantineAppShell.Footer>
      )}
      <MantineAppShell.Main>
        <Box maw={contentMaxWidth} mx="auto">
          {banner}
          {children}
        </Box>
      </MantineAppShell.Main>
    </MantineAppShell>
  );
}
