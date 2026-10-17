import { FriendsScreen } from '@vitapact/screen-friends';
import { NoteboardScreen } from '@vitapact/screen-noteboard';
import { OnboardingScreen } from '@vitapact/screen-onboarding';
import { SettingsScreen } from '@vitapact/screen-settings';
import { TodayScreen } from '@vitapact/screen-today';
import { WeekScreen } from '@vitapact/screen-week';
import type { CalendarDate } from '@vitapact/core/calendar';
import type { Profile, VitaPactDatabase } from '@vitapact/core/storage';
import type { IconName } from '@vitapact/ui';
import type { ComponentType } from 'react';

export const screenIds = [
  'onboarding',
  'today',
  'week',
  'friends',
  'noteboard',
  'settings',
] as const;
export type ScreenId = (typeof screenIds)[number];

/**
 * What the app hands every screen. A screen declares only the props it uses; the local database is
 * opened once here, and a screen that saves the profile calls `onProfileChange` so the others see it.
 */
export interface ScreenProps {
  db: VitaPactDatabase;
  /** Undefined only before onboarding has created it. */
  profile: Profile | undefined;
  onProfileChange: () => Promise<void>;
  /** Opens a day on Today, e.g. from Week's "Edit" (RF-04). */
  onEditDay: (date: CalendarDate) => void;
  /** The day Today opens on, when another screen asked for one. */
  openedDay: CalendarDate | undefined;
}

export interface NavRoute {
  id: ScreenId;
  Screen: ComponentType<ScreenProps>;
  /** Only the five main screens appear in the navigation; onboarding is the first-run flow. */
  nav?: { icon: IconName; labelKey: `nav.${ScreenId}` };
}

export const routes: readonly NavRoute[] = [
  { id: 'onboarding', Screen: OnboardingScreen },
  { id: 'today', Screen: TodayScreen, nav: { icon: 'today', labelKey: 'nav.today' } },
  { id: 'week', Screen: WeekScreen, nav: { icon: 'week', labelKey: 'nav.week' } },
  { id: 'friends', Screen: FriendsScreen, nav: { icon: 'friends', labelKey: 'nav.friends' } },
  {
    id: 'noteboard',
    Screen: NoteboardScreen,
    nav: { icon: 'noteboard', labelKey: 'nav.noteboard' },
  },
  { id: 'settings', Screen: SettingsScreen, nav: { icon: 'settings', labelKey: 'nav.settings' } },
];

export const DEFAULT_SCREEN: ScreenId = 'today';

export function isScreenId(value: string): value is ScreenId {
  return (screenIds as readonly string[]).includes(value);
}
