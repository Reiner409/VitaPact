import { useTranslation } from '@vitapact/i18n';
import { PageHeader } from '@vitapact/ui';

export function WeekScreen() {
  const { t } = useTranslation('week');
  return <PageHeader title={t('title')} />;
}
