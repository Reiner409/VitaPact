import { useTranslation } from '@vitapact/i18n';
import { PageHeader } from '@vitapact/ui';

export function FriendsScreen() {
  const { t } = useTranslation('friends');
  return <PageHeader title={t('title')} />;
}
