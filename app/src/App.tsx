import { I18nProvider, useTranslation } from '@vitapact/i18n';
import { AppShell, VitaPactProvider, type AppShellNavItem } from '@vitapact/ui';
import { useEffect } from 'react';
import { i18n } from './i18n';
import { useNavigation } from './navigation/navigationStore';
import { routes } from './navigation/routes';

function Shell() {
  const { t } = useTranslation('app');
  const { current, navigate, syncFromLocation } = useNavigation();

  useEffect(() => {
    window.addEventListener('hashchange', syncFromLocation);
    return () => window.removeEventListener('hashchange', syncFromLocation);
  }, [syncFromLocation]);

  const navItems: AppShellNavItem[] = routes.flatMap(({ id, nav }) =>
    nav
      ? [
          {
            id,
            label: t(nav.labelKey),
            icon: nav.icon,
            active: id === current,
            onSelect: () => navigate(id),
          },
        ]
      : [],
  );
  const CurrentScreen = routes.find((route) => route.id === current)!.Screen;

  return (
    <AppShell navLabel={t('nav.label')} navItems={navItems}>
      <CurrentScreen />
    </AppShell>
  );
}

export function App() {
  return (
    <I18nProvider i18n={i18n}>
      <VitaPactProvider>
        <Shell />
      </VitaPactProvider>
    </I18nProvider>
  );
}
