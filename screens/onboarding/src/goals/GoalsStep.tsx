import { useTranslation } from '@vitapact/i18n';
import { Card, NumberField, Stack, type NumberUnit } from '@vitapact/ui';
import { StepButtons } from '../StepButtons';
import { useState, type FormEvent } from 'react';
import { GOAL_KEYS, GOAL_RULES, invalidGoals, type GoalKey, type GoalsForm } from './goalsForm';

export interface GoalsStepProps {
  goals: GoalsForm;
  onChange: (goals: GoalsForm) => void;
  onBack: () => void;
  onContinue: () => void;
}

type TFunction = ReturnType<typeof useTranslation>['t'];

// NumberField has no unit for counts: the pillar's step (1) overrides the minutes step.
const UNITS: Record<GoalKey, NumberUnit> = {
  sleepHours: 'hours',
  workoutsPerWeek: 'minutes',
  sunMinutes: 'minutes',
};

const fieldText = (t: TFunction): Record<GoalKey, { label: string; unitLabel: string }> => ({
  sleepHours: { label: t('goals.sleepHours.label'), unitLabel: t('goals.sleepHours.unit') },
  workoutsPerWeek: {
    label: t('goals.workoutsPerWeek.label'),
    unitLabel: t('goals.workoutsPerWeek.unit'),
  },
  sunMinutes: { label: t('goals.sunMinutes.label'), unitLabel: t('goals.sunMinutes.unit') },
});

/** Errors appear after a first try to continue, like the nickname step. */
export function GoalsStep({ goals, onChange, onBack, onContinue }: GoalsStepProps) {
  const { t } = useTranslation('onboarding');
  const [triedToContinue, setTriedToContinue] = useState(false);
  const invalid = triedToContinue ? invalidGoals(goals) : [];
  const text = fieldText(t);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setTriedToContinue(true);
    if (invalidGoals(goals).length === 0) onContinue();
  };

  return (
    <Card>
      <form noValidate onSubmit={submit}>
        <Stack>
          {GOAL_KEYS.map((key) => {
            const { min, max, step } = GOAL_RULES[key];
            const error = invalid.includes(key) && t('goals.outOfRange', { min, max });
            return (
              <NumberField
                key={key}
                {...text[key]}
                unit={UNITS[key]}
                value={goals[key]}
                onChange={(value) => onChange({ ...goals, [key]: value })}
                min={min}
                max={max}
                step={step}
                {...(error && { error })}
              />
            );
          })}
          <StepButtons onBack={onBack} continueLabel={t('continue')} />
        </Stack>
      </form>
    </Card>
  );
}
