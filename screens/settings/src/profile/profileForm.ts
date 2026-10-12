import { sleepPillar, sunPillar, trainingPillar, type PillarGoal } from '@vitapact/core/pillars';
import { NICKNAME_MAX_LENGTH } from '@vitapact/core/report';
import type { Goals, Profile } from '@vitapact/core/storage';

export type GoalKey = keyof Goals;

/** What the user can change in the profile card; `null` is an emptied number field. */
export interface ProfileForm {
  nickname: string;
  goals: Record<GoalKey, number | null>;
  hideWeight: boolean;
}

export type ProfileFormError = 'nicknameRequired' | 'nicknameInvalid' | 'goalOutOfRange';

export interface ProfileFormErrors {
  nickname?: ProfileFormError;
  goals: Partial<Record<GoalKey, ProfileFormError>>;
}

/** Each stored goal takes its range and step from the pillar it measures. */
export const GOAL_RULES: Readonly<Record<GoalKey, PillarGoal>> = {
  sleepHours: sleepPillar.goal,
  workoutsPerWeek: trainingPillar.goal,
  sunMinutes: sunPillar.goal,
};

const GOAL_KEYS = Object.keys(GOAL_RULES) as GoalKey[];

/** Control characters, and lone surrogates that would not survive UTF-8 in a report. */
const UNPRINTABLE = /[\p{Cc}\p{Cs}]/u;

export function formOf(profile: Profile): ProfileForm {
  return {
    nickname: profile.nickname,
    goals: { ...profile.goals },
    hideWeight: profile.hideWeight,
  };
}

function nicknameError(nickname: string): ProfileFormError | undefined {
  const trimmed = nickname.trim();
  if (trimmed === '') return 'nicknameRequired';
  if ([...trimmed].length > NICKNAME_MAX_LENGTH || UNPRINTABLE.test(trimmed)) {
    return 'nicknameInvalid';
  }
  return undefined;
}

function isGoalValid(key: GoalKey, value: number | null): value is number {
  const { min, max, step } = GOAL_RULES[key];
  if (value === null || !Number.isFinite(value) || value < min || value > max) return false;
  const steps = (value - min) / step;
  return Math.abs(steps - Math.round(steps)) < 1e-9;
}

export function validateProfileForm(form: ProfileForm): ProfileFormErrors {
  const nickname = nicknameError(form.nickname);
  const goals: ProfileFormErrors['goals'] = {};
  for (const key of GOAL_KEYS) {
    if (!isGoalValid(key, form.goals[key])) goals[key] = 'goalOutOfRange';
  }
  return { ...(nickname && { nickname }), goals };
}

const hasErrors = (errors: ProfileFormErrors) =>
  errors.nickname !== undefined || Object.keys(errors.goals).length > 0;

/** The profile with the form applied, or `undefined` while the form has errors. */
export function applyForm(profile: Profile, form: ProfileForm): Profile | undefined {
  if (hasErrors(validateProfileForm(form))) return undefined;
  const { sleepHours, workoutsPerWeek, sunMinutes } = form.goals;
  if (sleepHours === null || workoutsPerWeek === null || sunMinutes === null) return undefined;
  return {
    ...profile,
    nickname: form.nickname.trim(),
    goals: { sleepHours, workoutsPerWeek, sunMinutes },
    hideWeight: form.hideWeight,
  };
}
