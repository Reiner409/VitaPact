import { useTranslation } from '@vitapact/i18n';
import { NumberField, type NumberUnit } from '@vitapact/ui';
import { GOAL_RULES, type GoalKey, type ProfileForm, type ProfileFormErrors } from './profileForm';

export interface GoalFieldsProps {
  goals: ProfileForm['goals'];
  errors: ProfileFormErrors['goals'];
  onChange: (key: GoalKey, value: number | null) => void;
}

type TFunction = ReturnType<typeof useTranslation>['t'];

// NumberField has no unit for counts: the core step (1) overrides the minutes step.
const goalFieldsText = (
  t: TFunction,
): { key: GoalKey; unit: NumberUnit; label: string; unitLabel: string }[] => [
  {
    key: 'sleepHours',
    unit: 'hours',
    label: t('profile.goals.sleepHours.label'),
    unitLabel: t('profile.goals.sleepHours.unit'),
  },
  {
    key: 'workoutsPerWeek',
    unit: 'minutes',
    label: t('profile.goals.workoutsPerWeek.label'),
    unitLabel: t('profile.goals.workoutsPerWeek.unit'),
  },
  {
    key: 'sunMinutes',
    unit: 'minutes',
    label: t('profile.goals.sunMinutes.label'),
    unitLabel: t('profile.goals.sunMinutes.unit'),
  },
];

export function GoalFields({ goals, errors, onChange }: GoalFieldsProps) {
  const { t } = useTranslation('settings');
  return goalFieldsText(t).map(({ key, unit, label, unitLabel }) => {
    const { min, max, step } = GOAL_RULES[key];
    const error = errors[key] && t('profile.errors.goalOutOfRange', { min, max });
    return (
      <NumberField
        key={key}
        label={label}
        unit={unit}
        unitLabel={unitLabel}
        value={goals[key]}
        onChange={(value) => onChange(key, value)}
        min={min}
        max={max}
        step={step}
        {...(error && { error })}
      />
    );
  });
}
