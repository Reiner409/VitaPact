import { sleepPillar, sunPillar, trainingPillar } from '@vitapact/core/pillars';
import { NICKNAME_MAX_LENGTH } from '@vitapact/core/report';
import { describe, expect, it } from 'vitest';
import {
  applyForm,
  formOf,
  GOAL_RULES,
  validateProfileForm,
  type ProfileForm,
} from './profileForm';
import { sampleProfile as testProfile } from '@vitapact/core/storage/testing';

const form = (changes: Partial<ProfileForm> = {}): ProfileForm => ({
  ...formOf(testProfile),
  ...changes,
});

const withGoal = (key: keyof ProfileForm['goals'], value: number | null) =>
  form({ goals: { ...formOf(testProfile).goals, [key]: value } });

describe('RF-01 profile form in settings', () => {
  it('starts from the stored nickname, goals and hide-weight choice', () => {
    expect(formOf(testProfile)).toEqual({
      nickname: 'Rei',
      goals: { sleepHours: 7.5, workoutsPerWeek: 3, sunMinutes: 20 },
      hideWeight: false,
    });
  });

  it('takes the goal ranges from the pillars', () => {
    expect(GOAL_RULES).toEqual({
      sleepHours: sleepPillar.goal,
      workoutsPerWeek: trainingPillar.goal,
      sunMinutes: sunPillar.goal,
    });
  });

  it('applies a valid form with the nickname trimmed', () => {
    const changed = form({
      nickname: '  Sam ',
      goals: { sleepHours: 8, workoutsPerWeek: 4, sunMinutes: 30 },
      hideWeight: true,
    });
    expect(applyForm(testProfile, changed)).toEqual({
      ...testProfile,
      nickname: 'Sam',
      goals: { sleepHours: 8, workoutsPerWeek: 4, sunMinutes: 30 },
      hideWeight: true,
    });
  });

  it.each([
    ['empty', '   ', 'nicknameRequired'],
    ['too long', 'x'.repeat(NICKNAME_MAX_LENGTH + 1), 'nicknameInvalid'],
    ['with a control character', 'Re\u0007i', 'nicknameInvalid'],
  ])('rejects a nickname that is %s', (_case, nickname, error) => {
    expect(validateProfileForm(form({ nickname })).nickname).toBe(error);
    expect(applyForm(testProfile, form({ nickname }))).toBeUndefined();
  });

  it('counts the nickname limit in characters, not UTF-16 units', () => {
    const nickname = '🌞'.repeat(NICKNAME_MAX_LENGTH);
    expect(validateProfileForm(form({ nickname })).nickname).toBeUndefined();
  });

  it.each([
    ['sleepHours', sleepPillar.goal.min - sleepPillar.goal.step],
    ['sleepHours', sleepPillar.goal.max + sleepPillar.goal.step],
    ['sleepHours', 7.3],
    ['workoutsPerWeek', 2.5],
    ['sunMinutes', sunPillar.goal.max + sunPillar.goal.step],
    ['sunMinutes', null],
  ] as const)('rejects %s = %s', (key, value) => {
    expect(validateProfileForm(withGoal(key, value)).goals).toEqual({ [key]: 'goalOutOfRange' });
    expect(applyForm(testProfile, withGoal(key, value))).toBeUndefined();
  });

  it('accepts the edges of every goal range', () => {
    for (const [key, { min, max }] of Object.entries(GOAL_RULES)) {
      const goal = key as keyof ProfileForm['goals'];
      expect(validateProfileForm(withGoal(goal, min)).goals).toEqual({});
      expect(validateProfileForm(withGoal(goal, max)).goals).toEqual({});
    }
  });
});

describe('RF-02 profile identity in settings', () => {
  it('keeps the user id and creation date when the form is applied', () => {
    const applied = applyForm(testProfile, form({ nickname: 'Sam' }));
    expect(applied?.userId).toBe(testProfile.userId);
    expect(applied?.createdAt).toBe(testProfile.createdAt);
  });
});
