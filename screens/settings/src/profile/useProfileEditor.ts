import type { Profile } from '@vitapact/core/storage';
import { useState } from 'react';
import {
  applyForm,
  formOf,
  validateProfileForm,
  type GoalKey,
  type ProfileForm,
  type ProfileFormErrors,
} from './profileForm';

export type ProfileNotice = 'saved' | 'saveFailed' | 'copied' | 'copyFailed';

export interface ProfileActions {
  onSave: (profile: Profile) => Promise<void>;
  onCopyUserId: (userId: string) => Promise<void>;
}

const NO_ERRORS: ProfileFormErrors = { goals: {} };

async function outcome(
  action: () => Promise<void>,
  success: ProfileNotice,
  failure: ProfileNotice,
) {
  try {
    await action();
    return success;
  } catch {
    return failure;
  }
}

/** Form state of the profile card; errors appear only after the first save attempt. */
export function useProfileEditor(profile: Profile, { onSave, onCopyUserId }: ProfileActions) {
  const [form, setForm] = useState<ProfileForm>(() => formOf(profile));
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<ProfileNotice>();

  const change = (changes: Partial<Omit<ProfileForm, 'goals'>>) =>
    setForm((current) => ({ ...current, ...changes }));
  const changeGoal = (key: GoalKey, value: number | null) =>
    setForm((current) => ({ ...current, goals: { ...current.goals, [key]: value } }));

  const save = async () => {
    setShowErrors(true);
    const updated = applyForm(profile, form);
    if (!updated) return;
    setSaving(true);
    setNotice(await outcome(() => onSave(updated), 'saved', 'saveFailed'));
    setSaving(false);
  };

  const copyUserId = async () =>
    setNotice(await outcome(() => onCopyUserId(profile.userId), 'copied', 'copyFailed'));

  return {
    form,
    errors: showErrors ? validateProfileForm(form) : NO_ERRORS,
    saving,
    notice,
    change,
    changeGoal,
    save,
    copyUserId,
    closeNotice: () => setNotice(undefined),
  };
}
