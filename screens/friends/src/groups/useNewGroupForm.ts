import { checkGroupDetails, type GroupDetailsError } from '@vitapact/core/groups';
import { useState, type FormEvent } from 'react';
import type { NewGroup } from './groupStore';

const EMPTY: NewGroup = { name: '', stake: '', memberIds: [] };
const NAME_ERRORS: readonly GroupDetailsError[] = ['nameMissing', 'nameTooLong'];
const isNameError = (error: GroupDetailsError) => NAME_ERRORS.includes(error);

/** The fields of the New group dialog, checked by core before anything is saved. */
export function useNewGroupForm(onCreate: (group: NewGroup) => Promise<void>, onClose: () => void) {
  const [group, setGroup] = useState(EMPTY);
  const [errors, setErrors] = useState<readonly GroupDetailsError[]>([]);
  const [saving, setSaving] = useState(false);

  const edit = (change: Partial<NewGroup>, keepError: (error: GroupDetailsError) => boolean) => {
    setGroup((current) => ({ ...current, ...change }));
    setErrors((current) => current.filter(keepError));
  };

  function close() {
    setGroup(EMPTY);
    setErrors([]);
    onClose();
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const checked = checkGroupDetails(group);
    if (!checked.ok) return setErrors(checked.errors);
    setSaving(true);
    await onCreate({ ...checked.details, memberIds: group.memberIds });
    setSaving(false);
    close();
  }

  const fields = {
    ...group,
    errors,
    setName: (name: string) => edit({ name }, (error) => !isNameError(error)),
    setStake: (stake: string) => edit({ stake }, isNameError),
    setMemberIds: (memberIds: string[]) => setGroup((current) => ({ ...current, memberIds })),
  };
  return { fields, saving, submit, close };
}

export type NewGroupFields = ReturnType<typeof useNewGroupForm>['fields'];
