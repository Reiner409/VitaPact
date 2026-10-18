import { useMediaQuery } from '@mantine/hooks';
import { tokens } from '../tokens';

const PHONE_WINDOW = `(max-width: ${tokens.layout.mobileBreakpoint - 1}px)`;

/** True on a phone-width window, where the bottom bar replaces the sidebar (RF-29). */
export function usePhoneLayout(): boolean {
  return useMediaQuery(PHONE_WINDOW, false, { getInitialValueInEffect: false });
}
