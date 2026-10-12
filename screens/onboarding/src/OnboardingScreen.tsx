import { useTranslation } from '@vitapact/i18n';
import { Button, Card, PageHeader } from '@vitapact/ui';
import { useState } from 'react';
import { NicknameStep } from './nickname/NicknameStep';

const STEPS = ['nickname', 'goals', 'privacy'] as const;
type Step = (typeof STEPS)[number];

/** The goals step arrives with F3-ON-02; until then it only leads back to the nickname. */
function GoalsStep({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation('onboarding');
  return (
    <Card>
      <p>{t('goals.title')}</p>
      <Button variant="secondary" onClick={onBack}>
        {t('back')}
      </Button>
    </Card>
  );
}

/** First launch: the choices stay in memory until the last step creates the profile. */
export function OnboardingScreen() {
  const { t } = useTranslation('onboarding');
  const [step, setStep] = useState<Step>('nickname');
  const [nickname, setNickname] = useState('');

  return (
    <>
      <PageHeader
        title={t('title')}
        subtitle={t('progress', { current: STEPS.indexOf(step) + 1, total: STEPS.length })}
      />
      {step === 'nickname' ? (
        <NicknameStep
          nickname={nickname}
          onChange={setNickname}
          onContinue={() => setStep('goals')}
        />
      ) : (
        <GoalsStep onBack={() => setStep('nickname')} />
      )}
    </>
  );
}
