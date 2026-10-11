import { useTranslation } from '@vitapact/i18n';
import { PageHeader } from '@vitapact/ui';

export function SettingsScreen() {
  const { t } = useTranslation('settings');
  return <PageHeader title={t('title')} />;
}
