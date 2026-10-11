import { create } from 'zustand';
import { DEFAULT_SCREEN, isScreenId, type ScreenId } from './routes';

const HASH_PREFIX = '#/';

export function screenFromHash(hash: string): ScreenId {
  const candidate = hash.startsWith(HASH_PREFIX) ? hash.slice(HASH_PREFIX.length) : '';
  return isScreenId(candidate) ? candidate : DEFAULT_SCREEN;
}

interface NavigationState {
  current: ScreenId;
  navigate: (screen: ScreenId) => void;
  syncFromLocation: () => void;
}

/** The current screen lives in the URL hash so a reload (and Playwright) can open any screen. */
export const useNavigation = create<NavigationState>((set) => ({
  current: screenFromHash(window.location.hash),
  navigate: (screen) => {
    window.location.hash = `${HASH_PREFIX}${screen}`;
    set({ current: screen });
  },
  syncFromLocation: () => set({ current: screenFromHash(window.location.hash) }),
}));
