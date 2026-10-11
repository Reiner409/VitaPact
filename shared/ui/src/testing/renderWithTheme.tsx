import { createI18n, I18nProvider, type TranslationTree } from '@vitapact/i18n';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { VitaPactProvider } from '../theme/VitaPactProvider';

/** Renders a component inside the VitaPact theme, as the app does. */
export function renderWithTheme(ui: ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: VitaPactProvider, ...options });
}

/**
 * Renders a screen or component with the theme and the given English namespaces,
 * e.g. `renderWithProviders(<TodayScreen />, { translations: { today: en } })`.
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    translations = {},
    ...options
  }: RenderOptions & { translations?: Record<string, TranslationTree> } = {},
) {
  const i18n = createI18n({ en: translations });
  const Providers = ({ children }: { children: ReactNode }) => (
    <I18nProvider i18n={i18n}>
      <VitaPactProvider>{children}</VitaPactProvider>
    </I18nProvider>
  );
  return render(ui, { wrapper: Providers, ...options });
}
