import { FriendsScreen } from '@vitapact/screen-friends';
import { NoteboardScreen } from '@vitapact/screen-noteboard';
import { OnboardingScreen } from '@vitapact/screen-onboarding';
import { SettingsScreen } from '@vitapact/screen-settings';
import { TodayScreen } from '@vitapact/screen-today';
import { WeekScreen } from '@vitapact/screen-week';
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

export interface NavRoute {
  id: ScreenId;
  Screen: ComponentType;
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
