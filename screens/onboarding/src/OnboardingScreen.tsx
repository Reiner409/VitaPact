import type { VitaPactDatabase } from '@vitapact/core/storage';
import { useTranslation } from '@vitapact/i18n';
import { PageHeader } from '@vitapact/ui';
import { useState } from 'react';
import { acceptPact, type PactChoices } from './acceptPact';
import { GoalsStep } from './goals/GoalsStep';
import { defaultGoalsForm, goalsOf } from './goals/goalsForm';
import { NicknameStep } from './nickname/NicknameStep';
import { PrivacyStep } from './privacy/PrivacyStep';

const STEPS = ['nickname', 'goals', 'privacy'] as const;
type Step = (typeof STEPS)[number];

export interface OnboardingScreenProps {
  db: VitaPactDatabase;
  /** Called once the profile exists, so the app leaves the welcome for good. */
  onProfileChange: () => Promise<void>;
  now?: () => Date;
}

type Acceptance = 'idle' | 'accepting' | 'failed';

function useAcceptance(db: VitaPactDatabase, onProfileChange: () => Promise<void>) {
  const [acceptance, setAcceptance] = useState<Acceptance>('idle');
  const accept = async (choices: PactChoices) => {
    setAcceptance('accepting');
    try {
      await acceptPact(db, choices);
      await onProfileChange();
    } catch {
      setAcceptance('failed');
    }
  };
  return { acceptance, accept };
}

function useOnboardingFlow({ db, onProfileChange, now = () => new Date() }: OnboardingScreenProps) {
  const [step, setStep] = useState<Step>('nickname');
  const [nickname, setNickname] = useState('');
  const [goals, setGoals] = useState(defaultGoalsForm);
  const { acceptance, accept } = useAcceptance(db, onProfileChange);

  const acceptWithChoices = () => {
    const validGoals = goalsOf(goals);
    if (!validGoals) return setStep('goals');
    void accept({ nickname, goals: validGoals, createdAt: now().toISOString() });
  };
  return { step, setStep, nickname, setNickname, goals, setGoals, acceptance, acceptWithChoices };
}

/** First launch: the choices stay in memory until the last step creates the profile. */
export function OnboardingScreen(props: OnboardingScreenProps) {
  const { t } = useTranslation('onboarding');
  const { step, setStep, nickname, setNickname, goals, setGoals, acceptance, acceptWithChoices } =
    useOnboardingFlow(props);

  return (
    <>
      <PageHeader
        title={t('title')}
        subtitle={t('progress', { current: STEPS.indexOf(step) + 1, total: STEPS.length })}
      />
      {step === 'nickname' && (
        <NicknameStep
          nickname={nickname}
          onChange={setNickname}
          onContinue={() => setStep('goals')}
        />
      )}
      {step === 'goals' && (
        <GoalsStep
          goals={goals}
          onChange={setGoals}
          onBack={() => setStep('nickname')}
          onContinue={() => setStep('privacy')}
        />
      )}
      {step === 'privacy' && (
        <PrivacyStep
          onBack={() => setStep('goals')}
          onAccept={acceptWithChoices}
          accepting={acceptance === 'accepting'}
          failed={acceptance === 'failed'}
        />
      )}
    </>
  );
}
