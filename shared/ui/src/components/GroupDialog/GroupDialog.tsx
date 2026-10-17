import type { GroupDetailsError } from '@vitapact/core/groups';
import { Banner } from '../Banner/Banner';
import { Button } from '../Button/Button';
import { Modal } from '../Modal/Modal';
import { Stack } from '../Stack/Stack';
import { GroupFields } from './GroupFields';
import { EMPTY_GROUP, useGroupForm, type GroupDraft } from './useGroupForm';

export interface GroupDialogFriend {
  userId: string;
  nickname: string;
}

/** Every text of the dialog, already translated (G5.5). */
export interface GroupDialogText {
  title: string;
  submit: string;
  cancel: string;
  close: string;
  name: string;
  stake: string;
  stakePlaceholder: string;
  members: string;
  noFriendsYet: string;
  saveFailed: string;
  /** Character counter under a field, e.g. "12 / 40". */
  counter: (length: number, max: number) => string;
  errors: Record<GroupDetailsError, string>;
}

export interface GroupDialogProps {
  opened: boolean;
  friends: readonly GroupDialogFriend[];
  /** The group being edited; empty when creating one. */
  initial?: GroupDraft;
  text: GroupDialogText;
  onSave: (group: GroupDraft) => Promise<void>;
  onClose: () => void;
}

type GroupFormProps = Omit<GroupDialogProps, 'opened' | 'initial'> & { initial: GroupDraft };

function GroupForm({ friends, initial, text, onSave, onClose }: GroupFormProps) {
  const { fields, saving, saveFailed, submit } = useGroupForm(initial, onSave, onClose);
  return (
    <form onSubmit={(event) => void submit(event)} noValidate>
      <Stack>
        <GroupFields fields={fields} friends={friends} text={text} />
        {saveFailed && (
          <Banner tone="warning" icon="error">
            {text.saveFailed}
          </Banner>
        )}
        <Button type="submit" loading={saving}>
          {text.submit}
        </Button>
        <Button variant="subtle" onClick={onClose}>
          {text.cancel}
        </Button>
      </Stack>
    </form>
  );
}

/**
 * RF-25: create or edit a group (name, stake, members among the imported friends). The form
 * starts again from `initial` every time the dialog opens.
 */
export function GroupDialog({ opened, initial = EMPTY_GROUP, ...form }: GroupDialogProps) {
  return (
    <Modal
      opened={opened}
      onClose={form.onClose}
      title={form.text.title}
      closeLabel={form.text.close}
    >
      {opened && <GroupForm initial={initial} {...form} />}
    </Modal>
  );
}
