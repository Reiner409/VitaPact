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
  /** Writes the profile; only its failure means the profile was not saved. */
  onSave: (profile: Profile) => Promise<void>;
  /** Runs after a successful save, e.g. to let the rest of the app reread the profile. */
  onSaved?: () => Promise<void>;
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
export function useProfileEditor(
  profile: Profile,
  { onSave, onSaved, onCopyUserId }: ProfileActions,
) {
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
    const result = await outcome(() => onSave(updated), 'saved', 'saveFailed');
    setNotice(result);
    setSaving(false);
    if (result === 'saved') await onSaved?.().catch(() => undefined);
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
