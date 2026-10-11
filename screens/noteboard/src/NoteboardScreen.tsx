import { useTranslation } from '@vitapact/i18n';
import { PageHeader } from '@vitapact/ui';

export function NoteboardScreen() {
  const { t } = useTranslation('noteboard');
  return <PageHeader title={t('title')} />;
}
