import { useTranslation } from '@vitapact/i18n';
import { Banner, Card, Stack } from '@vitapact/ui';
import type { FormEvent } from 'react';
import { StepButtons } from '../StepButtons';

export interface PrivacyStepProps {
  onBack: () => void;
  onAccept: () => void;
  accepting: boolean;
  failed: boolean;
}

/** RF-01, RF-02: what stays on this PC, then the pact that creates the profile. */
export function PrivacyStep({ onBack, onAccept, accepting, failed }: PrivacyStepProps) {
  const { t } = useTranslation('onboarding');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onAccept();
  };
  return (
    <Card>
      <form noValidate onSubmit={submit}>
        <Stack>
          <div>
            <h2>{t('privacy.title')}</h2>
            <p>{t('privacy.local')}</p>
            <p>{t('privacy.sharing')}</p>
            <p>{t('privacy.motto')}</p>
          </div>
          {failed && (
            <Banner tone="warning" icon="error">
              {t('privacy.failed')}
            </Banner>
          )}
          <StepButtons continueLabel={t('privacy.accept')} onBack={onBack} loading={accepting} />
        </Stack>
      </form>
    </Card>
  );
}
