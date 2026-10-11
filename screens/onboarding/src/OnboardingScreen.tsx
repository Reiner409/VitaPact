import { useTranslation } from '@vitapact/i18n';
import { PageHeader } from '@vitapact/ui';

export function OnboardingScreen() {
  const { t } = useTranslation('onboarding');
  return <PageHeader title={t('title')} />;
}
