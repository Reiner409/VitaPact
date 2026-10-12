import { toCalendarDate, type CalendarDate } from '@vitapact/core/calendar';
import type { Profile, VitaPactDatabase } from '@vitapact/core/storage';
import { I18nProvider, useTranslation } from '@vitapact/i18n';
import { AppShell, EmptyState, VitaPactProvider, type AppShellNavItem } from '@vitapact/ui';
import { useEffect, type ComponentType } from 'react';
import { i18n } from './i18n';
import { useNavigation } from './navigation/navigationStore';
import { DEFAULT_SCREEN, routes, type ScreenId, type ScreenProps } from './navigation/routes';
import { useLocalData, type OpenDatabase } from './storage/useLocalData';
import { useWeighInPrompt } from './weighIn/useWeighInPrompt';

/** Today's date, read again on every render so a session left open past midnight moves on. */
export type Clock = () => CalendarDate;

const systemClock: Clock = () => toCalendarDate(new Date());

const screens = Object.fromEntries(routes.map(({ id, Screen }) => [id, Screen])) as Record<
  ScreenId,
  ComponentType<ScreenProps>
>;

/** Without a profile the app shows only onboarding; with one, onboarding is never shown again. */
function visibleScreen(current: ScreenId, profile: Profile | undefined): ScreenId {
  if (!profile) return 'onboarding';
  return current === 'onboarding' ? DEFAULT_SCREEN : current;
}

function Shell({ clock, ...props }: ScreenProps & { clock: Clock }) {
  const { t } = useTranslation('app');
  const { current, navigate, syncFromLocation } = useNavigation();
  const weighIn = useWeighInPrompt(props.db, clock());

  useEffect(() => {
    window.addEventListener('hashchange', syncFromLocation);
    return () => window.removeEventListener('hashchange', syncFromLocation);
  }, [syncFromLocation]);

  const shown = visibleScreen(current, props.profile);
  const CurrentScreen = screens[shown];
  if (shown === 'onboarding') return <CurrentScreen {...props} />;

  const navItems: AppShellNavItem[] = routes.flatMap(({ id, nav }) =>
    nav
      ? [
          {
            id,
            label: t(nav.labelKey),
            icon: nav.icon,
            active: id === shown,
            onSelect: () => navigate(id),
          },
        ]
      : [],
  );
  return (
    <AppShell navLabel={t('nav.label')} navItems={navItems} banner={weighIn.banner}>
      <CurrentScreen {...props} />
      {weighIn.dialog}
    </AppShell>
  );
}

function LocalDataGate({ openDatabase, clock }: { openDatabase: OpenDatabase; clock: Clock }) {
  const { t } = useTranslation('app');
  const { data, reloadProfile } = useLocalData(openDatabase);
  if (data.status === 'opening') return null;
  if (data.status === 'unavailable') {
    return (
      <EmptyState
        icon="error"
        title={t('storage.unavailableTitle')}
        description={t('storage.unavailableText')}
      />
    );
  }
  return (
    <Shell db={data.db} profile={data.profile} onProfileChange={reloadProfile} clock={clock} />
  );
}

export interface AppProps {
  /** The real IndexedDB in the app; tests pass an in-memory one. */
  openDatabase: () => Promise<VitaPactDatabase>;
  /** The system date in the app; tests pass a fixed day. */
  clock?: Clock;
}

export function App({ openDatabase, clock = systemClock }: AppProps) {
  return (
    <I18nProvider i18n={i18n}>
      <VitaPactProvider>
        <LocalDataGate openDatabase={openDatabase} clock={clock} />
      </VitaPactProvider>
    </I18nProvider>
  );
}
