import { useTranslation } from '@vitapact/i18n';
import { PageHeader } from '@vitapact/ui';

export function TodayScreen() {
  const { t } = useTranslation('today');
  return <PageHeader title={t('title')} />;
}
