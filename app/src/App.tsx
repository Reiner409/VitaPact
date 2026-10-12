import type { Profile, VitaPactDatabase } from '@vitapact/core/storage';
import { I18nProvider, useTranslation } from '@vitapact/i18n';
import { AppShell, EmptyState, VitaPactProvider, type AppShellNavItem } from '@vitapact/ui';
import { useEffect, type ComponentType } from 'react';
import { i18n } from './i18n';
import { useNavigation } from './navigation/navigationStore';
import { DEFAULT_SCREEN, routes, type ScreenId, type ScreenProps } from './navigation/routes';
import { useLocalData, type OpenDatabase } from './storage/useLocalData';

const screens = Object.fromEntries(routes.map(({ id, Screen }) => [id, Screen])) as Record<
  ScreenId,
  ComponentType<ScreenProps>
>;

/** Without a profile the app shows only onboarding; with one, onboarding is never shown again. */
function visibleScreen(current: ScreenId, profile: Profile | undefined): ScreenId {
  if (!profile) return 'onboarding';
  return current === 'onboarding' ? DEFAULT_SCREEN : current;
}

function Shell(props: ScreenProps) {
  const { t } = useTranslation('app');
  const { current, navigate, syncFromLocation } = useNavigation();

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
    <AppShell navLabel={t('nav.label')} navItems={navItems}>
      <CurrentScreen {...props} />
    </AppShell>
  );
}

function LocalDataGate({ openDatabase }: { openDatabase: OpenDatabase }) {
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
  return <Shell db={data.db} profile={data.profile} onProfileChange={reloadProfile} />;
}

export interface AppProps {
  /** The real IndexedDB in the app; tests pass an in-memory one. */
  openDatabase: () => Promise<VitaPactDatabase>;
}

export function App({ openDatabase }: AppProps) {
  return (
    <I18nProvider i18n={i18n}>
      <VitaPactProvider>
        <LocalDataGate openDatabase={openDatabase} />
      </VitaPactProvider>
    </I18nProvider>
  );
}
