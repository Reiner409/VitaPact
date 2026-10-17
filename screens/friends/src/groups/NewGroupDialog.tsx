import type { Friend } from '@vitapact/core/storage';
import { GROUP_NAME_MAX_LENGTH, GROUP_STAKE_MAX_LENGTH } from '@vitapact/core/groups';
import { useTranslation } from '@vitapact/i18n';
import { GroupDialog, type GroupDialogText } from '@vitapact/ui';
import type { NewGroup } from './groupStore';

export interface NewGroupDialogProps {
  opened: boolean;
  friends: readonly Friend[];
  onCreate: (group: NewGroup) => Promise<void>;
  onClose: () => void;
}

function useNewGroupText(): GroupDialogText {
  const { t } = useTranslation('friends');
  return {
    title: t('newGroup.title'),
    submit: t('newGroup.create'),
    cancel: t('newGroup.cancel'),
    close: t('close'),
    name: t('newGroup.name'),
    stake: t('newGroup.stake'),
    stakePlaceholder: t('newGroup.stakePlaceholder'),
    members: t('newGroup.members'),
    noFriendsYet: t('newGroup.noFriendsYet'),
    saveFailed: t('newGroup.saveFailed'),
    counter: (length, max) => t('newGroup.counter', { length, max }),
    errors: {
      nameMissing: t('newGroup.errors.nameMissing'),
      nameTooLong: t('newGroup.errors.nameTooLong', { max: GROUP_NAME_MAX_LENGTH }),
      stakeMissing: t('newGroup.errors.stakeMissing'),
      stakeTooLong: t('newGroup.errors.stakeTooLong', { max: GROUP_STAKE_MAX_LENGTH }),
    },
  };
}

/** RF-25: name, stake and members chosen among the friends already imported. */
export function NewGroupDialog({ opened, friends, onCreate, onClose }: NewGroupDialogProps) {
  return (
    <GroupDialog
      opened={opened}
      friends={friends}
      text={useNewGroupText()}
      onSave={onCreate}
      onClose={onClose}
    />
  );
}
