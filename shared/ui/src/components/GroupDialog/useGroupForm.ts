import {
  checkGroupDetails,
  type GroupDetails,
  type GroupDetailsError,
} from '@vitapact/core/groups';
import { useState, type FormEvent } from 'react';

/** What the dialog edits: name and stake as typed, members picked among the friends. */
export interface GroupDraft extends GroupDetails {
  memberIds: readonly string[];
}

export const EMPTY_GROUP: GroupDraft = { name: '', stake: '', memberIds: [] };

const NAME_ERRORS: readonly GroupDetailsError[] = ['nameMissing', 'nameTooLong'];
const isNameError = (error: GroupDetailsError) => NAME_ERRORS.includes(error);

/** The group fields, checked by core before anything is saved (RF-25). */
export function useGroupForm(
  initial: GroupDraft,
  onSave: (group: GroupDraft) => Promise<void>,
  onClose: () => void,
) {
  const [group, setGroup] = useState(initial);
  const [errors, setErrors] = useState<readonly GroupDetailsError[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  const edit = (change: Partial<GroupDraft>, keepError: (error: GroupDetailsError) => boolean) => {
    setGroup((current) => ({ ...current, ...change }));
    setErrors((current) => current.filter(keepError));
  };

  async function submit(event: FormEvent) {
    event.preventDefault();
    const checked = checkGroupDetails(group);
    if (!checked.ok) return setErrors(checked.errors);
    setSaving(true);
    setSaveFailed(false);
    try {
      await onSave({ ...checked.details, memberIds: group.memberIds });
      onClose();
    } catch {
      // The dialog stays open with what the user typed, so they can try again.
      setSaveFailed(true);
    } finally {
      setSaving(false);
    }
  }

  const fields = {
    ...group,
    errors,
    setName: (name: string) => edit({ name }, (error) => !isNameError(error)),
    setStake: (stake: string) => edit({ stake }, isNameError),
    setMemberIds: (memberIds: string[]) => setGroup((current) => ({ ...current, memberIds })),
  };
  return { fields, saving, saveFailed, submit };
}

export type GroupFormFields = ReturnType<typeof useGroupForm>['fields'];
