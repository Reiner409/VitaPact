import { create } from 'zustand';
import type { CalendarDate } from '@vitapact/core/calendar';
import { DEFAULT_SCREEN, isScreenId, type ScreenId } from './routes';

const HASH_PREFIX = '#/';

export function screenFromHash(hash: string): ScreenId {
  const candidate = hash.startsWith(HASH_PREFIX) ? hash.slice(HASH_PREFIX.length) : '';
  return isScreenId(candidate) ? candidate : DEFAULT_SCREEN;
}

interface NavigationState {
  current: ScreenId;
  /** A day another screen asked Today to open, e.g. Week's "Edit" (RF-04). */
  dayToOpen: CalendarDate | undefined;
  navigate: (screen: ScreenId, dayToOpen?: CalendarDate) => void;
  syncFromLocation: () => void;
}

/** The current screen lives in the URL hash so a reload (and Playwright) can open any screen. */
export const useNavigation = create<NavigationState>((set) => ({
  current: screenFromHash(window.location.hash),
  dayToOpen: undefined,
  navigate: (screen, dayToOpen) => {
    window.location.hash = `${HASH_PREFIX}${screen}`;
    set({ current: screen, dayToOpen });
  },
  // The hash change that `navigate` itself causes keeps the day it asked for.
  syncFromLocation: () =>
    set((state) => {
      const current = screenFromHash(window.location.hash);
      return current === state.current ? state : { current, dayToOpen: undefined };
    }),
}));
